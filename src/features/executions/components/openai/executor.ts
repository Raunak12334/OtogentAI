import type { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { openaiChannel } from "@/inngest/channels/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type OpenAIData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const OpenAIExecutor: NodeExecutor<OpenAIData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(`publish-loading-${nodeId}`, openaiChannel.status, {
        nodeId,
        status: "loading",
    }
    );

    if (!data.variableName) {
        await step.realtime.publish(`publish-error-${nodeId}`, openaiChannel.status, {
            nodeId,
            status: "error",
        });
        throw new NonRetriableError("OpenAI node: Variable name is missing");
    }

    if (!data.userPrompt) {
        await step.realtime.publish(`publish-error-${nodeId}`, openaiChannel.status, {
            nodeId,
            status: "error",
        });
        throw new NonRetriableError("OpenAI node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credentialValue = process.env.OPENAI_API_KEY!;

    const openai = createOpenAI({
        apiKey: credentialValue
    });

    try {
        const { steps } = await step.ai.wrap("openai-generate-text",
            generateText,
            {
                model: openai("gpt-5"),
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

        await step.realtime.publish(`publish-success-${nodeId}`, openaiChannel.status, {
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
        await step.realtime.publish(`publish-error-${nodeId}`, openaiChannel.status, {
            nodeId,
            status: "error",
        }
        );

        throw error;
    }

};