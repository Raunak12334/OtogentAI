"use server";

import { googleFormTriggerChannel, GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type GoogleFormTriggerToken = Realtime.Subscribe.Token<
    typeof GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
    string[]
>;

export async function fetchGoogleFormTriggerRealtimeToken(): Promise<GoogleFormTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}
