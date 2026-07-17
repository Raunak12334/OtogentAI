import { inngest } from "./client";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const process = inngest.createFunction(
    {
        id: "process-ai",
        triggers: { event: "process/ai" }
    },
    async ({ event, step }) => {
        const { steps: geminiSteps } = await step.ai.wrap("gemini=generate-text", generateText, {
            system: "You're a helpful assistant",
            prompt: "what does prompt mean",
            model: google('gemini-3.5-flash'),
        });

        const { steps: openaiSteps } = await step.ai.wrap("gemini=generate-text", generateText, {
            system: "You're a helpful assistant",
            prompt: "what does prompt mean",
            model: openai('gpt-4o-mini'),
        });

        const { steps: anthropicSteps } = await step.ai.wrap("gemini=generate-text", generateText, {
            system: "You're a helpful assistant",
            prompt: "what does prompt mean",
            model: anthropic('claude-haiku'),
        });
        return {
            geminiSteps,
            openaiSteps,
            anthropicSteps,
        };

    }
);