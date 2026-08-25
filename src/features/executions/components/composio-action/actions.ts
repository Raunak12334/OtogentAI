"use server";

import { COMPOSIO_ACTION_CHANNEL_NAME } from "@/inngest/channels/composio-action";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type ComposioActionToken = Realtime.Subscribe.Token<
    typeof COMPOSIO_ACTION_CHANNEL_NAME,
    string[]
>;

export async function fetchComposioActionRealtimeToken(): Promise<ComposioActionToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: COMPOSIO_ACTION_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}
