import { channel, staticSchema } from "inngest/realtime";

export const COMPOSIO_ACTION_CHANNEL_NAME = "composio-action-execution";
export const composioActionChannel = channel({
    name: COMPOSIO_ACTION_CHANNEL_NAME,
    topics: {
        status: {
            schema: staticSchema<{
                nodeId: string;
                status: "loading" | "success" | "error";
            }>(),
        },
    },
});
