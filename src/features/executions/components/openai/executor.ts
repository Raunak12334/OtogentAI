import type { NodeExecutor } from "@/features/executions/types";
import { openaiChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

export type OpenAINodeData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAINodeData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(
        `publish-loading-${nodeId}`,
        openaiChannel.status,
        {
            nodeId,
            status: "loading",
        }
    );

    try {
        const result = await step.run(
            `openai-${data.variableName || nodeId}`,
            async () => {
                if (!data.variableName) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        openaiChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "OpenAI node: Variable name not configured"
                    );
                }

                if (!data.credentialId) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        openaiChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "OpenAI node: No credential selected"
                    );
                }

                if (!data.userPrompt) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        openaiChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "OpenAI node: User prompt not configured"
                    );
                }

                const credential = await prisma.credential.findUnique({
                    where: { id: data.credentialId },
                });

                if (!credential?.value) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        openaiChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "OpenAI node: Selected credential not found or empty"
                    );
                }

                const openai = createOpenAI({
                    apiKey: credential.value,
                });

                const prompt = Handlebars.compile(data.userPrompt)(context);
                const system = data.systemPrompt
                    ? Handlebars.compile(data.systemPrompt)(context)
                    : undefined;

                const response = await generateText({
                    model: openai(data.model || "gpt-4o-mini"),
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
            openaiChannel.status,
            {
                nodeId,
                status: "success",
            }
        );

        return result;
    } catch (error) {
        await step.realtime.publish(
            `publish-error-${nodeId}`,
            openaiChannel.status,
            {
                nodeId,
                status: "error",
            }
        );
        throw error;
    }
};
