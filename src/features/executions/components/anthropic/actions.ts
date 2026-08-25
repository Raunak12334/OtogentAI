"use server";

import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type AnthropicToken = Realtime.Subscribe.Token<
    typeof ANTHROPIC_CHANNEL_NAME,
    string[]
>;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: ANTHROPIC_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}
