"use server";

import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type OpenAIToken = Realtime.Subscribe.Token<
    typeof OPENAI_CHANNEL_NAME,
    string[]
>;

export async function fetchOpenAIRealtimeToken(): Promise<OpenAIToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: OPENAI_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}
