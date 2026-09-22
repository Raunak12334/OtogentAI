"use server";

import { getSubscriptionToken, type Realtime } from "inngest/realtime";
import { TELEGRAM_ACTION_CHANNEL_NAME } from "@/inngest/channels/telegram-action";
import { inngest } from "@/inngest/client";

export type TelegramActionToken = Realtime.Subscribe.Token<
  typeof TELEGRAM_ACTION_CHANNEL_NAME,
  string[]
>;

export async function fetchTelegramActionRealtimeToken(): Promise<TelegramActionToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: TELEGRAM_ACTION_CHANNEL_NAME,
    topics: ["status"],
  });

  return token;
}
