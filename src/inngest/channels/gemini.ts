import { channel, staticSchema } from "inngest/realtime";

export const GEMINI_CHANNEL_NAME = "gemini-execution";
export const geminiChannel = channel({
    name: GEMINI_CHANNEL_NAME,
    topics: {
        status: {
            schema: staticSchema<{
                nodeId: string;
                status: "loading" | "success" | "error";
            }>(),
        },
    },
});
