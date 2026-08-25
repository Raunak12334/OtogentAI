"use server";

import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type GeminiToken = Realtime.Subscribe.Token<
    typeof GEMINI_CHANNEL_NAME,
    string[]
>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: GEMINI_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}
