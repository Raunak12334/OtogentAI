import { channel, staticSchema } from "inngest/realtime";

export const ANTHROPIC_CHANNEL_NAME = "anthropic-execution";
export const anthropicChannel = channel({
    name: ANTHROPIC_CHANNEL_NAME,
    topics: {
        status: {
            schema: staticSchema<{
                nodeId: string;
                status: "loading" | "success" | "error";
            }>(),
        },
    },
});
