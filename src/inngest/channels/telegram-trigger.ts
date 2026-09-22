import { channel, staticSchema } from "inngest/realtime";

export const TELEGRAM_TRIGGER_CHANNEL_NAME = "telegram-trigger-execution";
export const telegramTriggerChannel = channel({
  name: TELEGRAM_TRIGGER_CHANNEL_NAME,
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
