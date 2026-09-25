import { channel, staticSchema } from "inngest/realtime";

export const WHATSAPP_TRIGGER_CHANNEL_NAME = "whatsapp-trigger-execution";
export const whatsappTriggerChannel = channel({
  name: WHATSAPP_TRIGGER_CHANNEL_NAME,
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
