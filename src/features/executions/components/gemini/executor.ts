import type { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type GeminiData = {
    credentialId?: string;
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(`publish-loading-${nodeId}`, geminiChannel.status, {
        nodeId,
        status: "loading",
    }
    );

    if (!data.variableName) {
        await step.realtime.publish(`publish-error-${nodeId}`, geminiChannel.status, {
            nodeId,
            status: "error",
        });
        throw new NonRetriableError("Gemini node: Variable name is missing");
    }

    if (!data.credentialId) {
        await step.realtime.publish(`publish-error-${nodeId}`, geminiChannel.status, {
            nodeId,
            status: "error",
        });
        throw new NonRetriableError("Gemini node: Credential name is missing");
    }

    if (!data.userPrompt) {
        await step.realtime.publish(`publish-error-${nodeId}`, geminiChannel.status, {
            nodeId,
            status: "error",
        });
        throw new NonRetriableError("Gemini node: User prompt is missing");
    }


    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
            }
        })
    })

    if (!credential) {
        throw new NonRetriableError("Gemini node: Credential not found");
    }


    const google = createGoogleGenerativeAI({
        apiKey: credential.value,
    });

    try {
        const { steps } = await step.ai.wrap("gemini-generate-text",
            generateText,
            {
                model: google("gemini-3.6-flash"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            },
        );
        const text = steps[0].content[0].type === "text" ?
            steps[0].content[0].text : "";

        await step.realtime.publish(`publish-success-${nodeId}`, geminiChannel.status, {
            nodeId,
            status: "success",
        });

        return {
            ...context,
            [data.variableName]: {
                text,
                aiResponse: text,
            },
        }
    } catch (error) {
        await step.realtime.publish(`publish-error-${nodeId}`, geminiChannel.status, {
            nodeId,
            status: "error",
        }
        );

        throw error;
    }

};