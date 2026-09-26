import { channel, staticSchema } from "inngest/realtime";

export const WHATSAPP_ACTION_CHANNEL_NAME = "whatsapp-action-execution";
export const whatsappActionChannel = channel({
  name: WHATSAPP_ACTION_CHANNEL_NAME,
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
