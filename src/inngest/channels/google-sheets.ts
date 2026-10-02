import { channel, staticSchema } from "inngest/realtime";

export const GOOGLE_SHEETS_CHANNEL_NAME = "google-sheets-execution";
export const googleSheetsChannel = channel({
  name: GOOGLE_SHEETS_CHANNEL_NAME,
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
