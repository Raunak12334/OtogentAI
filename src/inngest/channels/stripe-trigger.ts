import { channel, staticSchema } from "inngest/realtime";

export const STRIPE_TRIGGER_CHANNEL_NAME = "stripe-trigger-execution";
export const stripeTriggerChannel = channel({
    name: STRIPE_TRIGGER_CHANNEL_NAME,
    topics: {
        status: {
            schema: staticSchema<{
                nodeId: string;
                status: "loading" | "success" | "error";
            }>(),
        },
    },
});
