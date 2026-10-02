"use server";

import { getSubscriptionToken, type Realtime } from "inngest/realtime";
import { GOOGLE_SHEETS_CHANNEL_NAME } from "@/inngest/channels/google-sheets";
import { inngest } from "@/inngest/client";

export type GoogleSheetsToken = Realtime.Subscribe.Token<
  typeof GOOGLE_SHEETS_CHANNEL_NAME,
  string[]
>;

export async function fetchGoogleSheetsRealtimeToken(): Promise<GoogleSheetsToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: GOOGLE_SHEETS_CHANNEL_NAME,
    topics: ["status"],
  });
  return token;
}
