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

export const geminiExecutor: NodeExecutor<GeminiNodeData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(
        `publish-loading-${nodeId}`,
        geminiChannel.status,
        {
            nodeId,
            status: "loading",
        }
    );

    try {
        const result = await step.run(
            `gemini-${data.variableName || nodeId}`,
            async () => {
                if (!data.variableName) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        geminiChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "Gemini node: Variable name not configured"
                    );
                }

                if (!data.credentialId) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        geminiChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "Gemini node: No credential selected"
                    );
                }

                if (!data.userPrompt) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        geminiChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
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
                        {
                            nodeId,
                            status: "error",
                        }
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

                const response = await generateText({
                    model: google(data.model || "gemini-2.0-flash"),
                    prompt,
                    system,
                });

                return {
                    ...context,
                    [data.variableName]: {
                        text: response.text,
                        finishReason: response.finishReason,
                        usage: response.usage,
                    },
                };
            }
        );

        await step.realtime.publish(
            `publish-success-${nodeId}`,
            geminiChannel.status,
            {
                nodeId,
                status: "success",
            }
        );

        return result;
    } catch (error) {
        await step.realtime.publish(
            `publish-error-${nodeId}`,
            geminiChannel.status,
            {
                nodeId,
                status: "error",
            }
        );
        throw error;
    }
};
