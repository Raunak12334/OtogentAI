"use server";

import { getSubscriptionToken, type Realtime } from "inngest/realtime";
import { WHATSAPP_ACTION_CHANNEL_NAME } from "@/inngest/channels/whatsapp-action";
import { inngest } from "@/inngest/client";

export type WhatsAppActionToken = Realtime.Subscribe.Token<
  typeof WHATSAPP_ACTION_CHANNEL_NAME,
  string[]
>;

export async function fetchWhatsAppActionRealtimeToken(): Promise<WhatsAppActionToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: WHATSAPP_ACTION_CHANNEL_NAME,
    topics: ["status"],
  });

  return token;
}
