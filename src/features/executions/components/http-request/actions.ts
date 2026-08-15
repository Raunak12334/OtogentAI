"use server"

import { HTTP_REQUEST_CHANNEL_NAME } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type HttpRequestToken = Realtime.Subscribe.Token<
    typeof HTTP_REQUEST_CHANNEL_NAME,
    string[]
>;

export async function fetchHttpRequestRealtimeToken(): Promise<HttpRequestToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: HTTP_REQUEST_CHANNEL_NAME,
        topics: ["status"],
    });

    return token;
}