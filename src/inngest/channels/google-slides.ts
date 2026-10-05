import { channel, staticSchema } from "inngest/realtime";

export const GOOGLE_SLIDES_CHANNEL_NAME = "google-slides-execution";
export const googleSlidesChannel = channel({
  name: GOOGLE_SLIDES_CHANNEL_NAME,
  topics: {
    status: {
      schema: staticSchema<{
        nodeId: string;
        status: "loading" | "success" | "error";
      }>(),
    },
  },
});
