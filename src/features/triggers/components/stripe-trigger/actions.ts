"use server";

import { stripeTriggerChannel, STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type StripeTriggerToken = Realtime.Subscribe.Token<
    typeof STRIPE_TRIGGER_CHANNEL_NAME,
    string[]
>;

export async function fetchStripeTriggerRealtimeToken(): Promise<StripeTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: STRIPE_TRIGGER_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}
