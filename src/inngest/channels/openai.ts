import { channel, staticSchema } from "inngest/realtime";

export const OPENAI_CHANNEL_NAME = "openai-execution";
export const openaiChannel = channel({
    name: OPENAI_CHANNEL_NAME,
    topics: {
        status: {
            schema: staticSchema<{
                nodeId: string;
                status: "loading" | "success" | "error";
            }>(),
        },
    },
});
