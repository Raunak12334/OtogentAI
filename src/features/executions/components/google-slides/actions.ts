"use server";

import { getSubscriptionToken, type Realtime } from "inngest/realtime";
import { GOOGLE_SLIDES_CHANNEL_NAME } from "@/inngest/channels/google-slides";
import { inngest } from "@/inngest/client";

export type GoogleSlidesToken = Realtime.Subscribe.Token<
  typeof GOOGLE_SLIDES_CHANNEL_NAME,
  string[]
>;

export async function fetchGoogleSlidesRealtimeToken(): Promise<GoogleSlidesToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: GOOGLE_SLIDES_CHANNEL_NAME,
    topics: ["status"],
  });
  return token;
}
