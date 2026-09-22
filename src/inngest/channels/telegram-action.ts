import { channel, staticSchema } from "inngest/realtime";

export const TELEGRAM_ACTION_CHANNEL_NAME = "telegram-action-execution";
export const telegramActionChannel = channel({
  name: TELEGRAM_ACTION_CHANNEL_NAME,
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
