import type { NodeExecutor } from "@/features/executions/types";
import { geminiChannel } from "@/inngest/channels/gemini";
import prisma from "@/lib/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

export type GeminiNodeData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true for transient overload / rate-limit errors that are worth retrying */
function isOverloadError(err: unknown): boolean {
    const msg = String(err instanceof Error ? err.message : err).toLowerCase();
    return (
        msg.includes("high demand") ||
        msg.includes("overloaded") ||
        msg.includes("rate limit") ||
        msg.includes("resource_exhausted") ||
        msg.includes("quota") ||
        msg.includes("503") ||
        msg.includes("429")
    );
}

/** Sleep for `ms` milliseconds */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call `fn` with exponential backoff on overload errors.
 * Retries up to `maxAttempts - 1` times with delays: 2s, 4s, 8s …
 */
async function withBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts = 4,
    baseDelayMs = 2000,
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (!isOverloadError(err) || attempt === maxAttempts) throw err;
            const delay = baseDelayMs * Math.pow(2, attempt - 1); // 2s, 4s, 8s
            console.warn(
                `[gemini] Overload error on attempt ${attempt}/${maxAttempts}. Retrying in ${delay}ms…`,
                String(err),
            );
            await sleep(delay);
        }
    }
    throw lastError;
}

// Fallback model chain — tried in order when the primary model is overloaded.
// Using current available Gemini API model IDs.
const FALLBACK_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash-preview-04-17",
];

/** Map the app's display-friendly aliases → real Gemini API model IDs */
function resolveModelName(raw: string | undefined): string {
    const name = (raw || "gemini-3.8-flash").replace(/^models\//, "");
    const aliases: Record<string, string> = {
        "gemini-3.6-flash":      "gemini-3.8-flash",
        "gemini-2.0-flash":      "gemini-3.8-flash",
        "gemini-2.0-flash-lite": "gemini-3.5-flash-lite",
        "gemini-2.5-flash":      "gemini-2.5-flash-preview-04-17",
        "gemini-2.5-pro":        "gemini-2.5-pro-preview-05-06",
    };
    return aliases[name] ?? name;
}

// ---------------------------------------------------------------------------
// Executor
// ---------------------------------------------------------------------------

export const geminiExecutor: NodeExecutor<GeminiNodeData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(
        `publish-loading-${nodeId}`,
        geminiChannel.status,
        { nodeId, status: "loading" }
    );

    try {
        const result = await step.run(
            `gemini-${data.variableName || nodeId}`,
            async () => {
                if (!data.variableName) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        geminiChannel.status,
                        { nodeId, status: "error" }
                    );
                    throw new NonRetriableError(
                        "Gemini node: Variable name not configured"
                    );
                }

                if (!data.credentialId) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        geminiChannel.status,
                        { nodeId, status: "error" }
                    );
                    throw new NonRetriableError(
                        "Gemini node: No credential selected"
                    );
                }

                if (!data.userPrompt) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        geminiChannel.status,
                        { nodeId, status: "error" }
                    );
                    throw new NonRetriableError(
                        "Gemini node: User prompt not configured"
                    );
                }

                const credential = await prisma.credential.findUnique({
                    where: { id: data.credentialId },
                });

                if (!credential?.value) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        geminiChannel.status,
                        { nodeId, status: "error" }
                    );
                    throw new NonRetriableError(
                        "Gemini node: Selected credential not found or empty"
                    );
                }

                const google = createGoogleGenerativeAI({
                    apiKey: credential.value,
                });

                const prompt = Handlebars.compile(data.userPrompt)(context);
                const system = data.systemPrompt
                    ? Handlebars.compile(data.systemPrompt)(context)
                    : undefined;

                // Resolve the configured model alias to a real API model ID
                const primaryModel = resolveModelName(data.model);

                // Build the ordered model list: primary first, then fallbacks
                const modelsToTry = [
                    primaryModel,
                    ...FALLBACK_MODELS.filter((m) => m !== primaryModel),
                ];

                let lastErr: unknown;
                for (const modelName of modelsToTry) {
                    try {
                        console.log(`[gemini] Trying model: ${modelName}`);
                        const response = await withBackoff(() =>
                            generateText({
                                model: google(modelName),
                                prompt,
                                system,
                            })
                        );

                        return {
                            ...context,
                            [data.variableName]: {
                                text: response.text,
                                finishReason: response.finishReason,
                                usage: response.usage,
                                modelUsed: modelName,
                            },
                        };
                    } catch (err) {
                        lastErr = err;
                        if (isOverloadError(err)) {
                            console.warn(
                                `[gemini] Model "${modelName}" overloaded after retries, trying next fallback…`
                            );
                            continue; // try next model in the list
                        }
                        throw err; // non-overload error — surface immediately
                    }
                }

                // All models exhausted
                throw new Error(
                    `Gemini node: All models are currently overloaded. Last error: ${String(lastErr)}`
                );
            }
        );

        await step.realtime.publish(
            `publish-success-${nodeId}`,
            geminiChannel.status,
            { nodeId, status: "success" }
        );

        return result;
    } catch (error) {
        await step.realtime.publish(
            `publish-error-${nodeId}`,
            geminiChannel.status,
            { nodeId, status: "error" }
        );
        throw error;
    }
};
