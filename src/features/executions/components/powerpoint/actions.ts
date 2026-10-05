"use server";

import { getSubscriptionToken, type Realtime } from "inngest/realtime";
import { POWERPOINT_CHANNEL_NAME } from "@/inngest/channels/powerpoint";
import { inngest } from "@/inngest/client";

export type PowerPointToken = Realtime.Subscribe.Token<
  typeof POWERPOINT_CHANNEL_NAME,
  string[]
>;

export async function fetchPowerPointRealtimeToken(): Promise<PowerPointToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: POWERPOINT_CHANNEL_NAME,
    topics: ["status"],
  });

  return token;
}
