import { channel, staticSchema } from "inngest/realtime";

export const GOOGLE_FORM_TRIGGER_CHANNEL_NAME = "google-form-trigger-execution";
export const googleFormTriggerChannel = channel({
    name: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
    topics: {
        status: {
            schema: staticSchema<{
                nodeId: string;
                status: "loading" | "success" | "error";
            }>(),
        },
    },
});
