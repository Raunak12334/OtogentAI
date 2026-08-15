"use server";

import { manualTriggerChannel, MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type ManualTriggerToken = Realtime.Subscribe.Token<
    typeof MANUAL_TRIGGER_CHANNEL_NAME,
    string[]
>;

export async function fetchManualTriggerRealtimeToken(): Promise<ManualTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: MANUAL_TRIGGER_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}
