import { channel, staticSchema } from "inngest/realtime";

export const POWERPOINT_CHANNEL_NAME = "powerpoint-execution";
export const powerpointChannel = channel({
  name: POWERPOINT_CHANNEL_NAME,
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
