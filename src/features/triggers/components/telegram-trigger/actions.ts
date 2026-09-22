"use server";

import crypto from "node:crypto";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";
import { TELEGRAM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/telegram-trigger";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

export type TelegramTriggerToken = Realtime.Subscribe.Token<
  typeof TELEGRAM_TRIGGER_CHANNEL_NAME,
  string[]
>;

export async function fetchTelegramTriggerRealtimeToken(): Promise<TelegramTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: TELEGRAM_TRIGGER_CHANNEL_NAME,
    topics: ["status"],
  });

  return token;
}

export interface ConnectWebhookParams {
  workflowId: string;
  nodeId: string;
  botToken: string;
  webhookBaseUrl: string;
  commandFilter?: string;
}

export async function connectTelegramWebhook({
  workflowId,
  nodeId,
  botToken,
  webhookBaseUrl,
  commandFilter,
}: ConnectWebhookParams) {
  const cleanToken = botToken.trim();
  if (!cleanToken) {
    return { success: false, error: "Bot token is required" };
  }

  const cleanBaseUrl = webhookBaseUrl.trim().replace(/\/+$/, "");
  if (!cleanBaseUrl.startsWith("https://")) {
    return {
      success: false,
      error:
        "Telegram requires an HTTPS webhook URL. Please use an HTTPS URL or tunnel (e.g. ngrok).",
    };
  }

  try {
    // 1. Verify Bot Token using getMe
    const getMeRes = await fetch(
      `https://api.telegram.org/bot${cleanToken}/getMe`,
    );
    const getMeData = await getMeRes.json();

    if (!getMeData.ok) {
      return {
        success: false,
        error: getMeData.description || "Invalid Bot Token",
      };
    }

    const botUsername = getMeData.result.username || "";
    const botName = getMeData.result.first_name || "";

    // 2. Generate a secure random secret_token (1-256 chars, A-Z, a-z, 0-9, _, -)
    const secretToken = crypto.randomBytes(24).toString("base64url");
    const webhookUrl = `${cleanBaseUrl}/api/webhooks/telegram?workflowId=${workflowId}`;

    // 3. Register webhook with Telegram
    const setWebhookRes = await fetch(
      `https://api.telegram.org/bot${cleanToken}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secretToken,
          allowed_updates: ["message", "channel_post", "edited_message"],
        }),
      },
    );

    const setWebhookData = await setWebhookRes.json();
    if (!setWebhookData.ok) {
      return {
        success: false,
        error: setWebhookData.description || "Failed to set Telegram webhook",
      };
    }

    // 4. Update node data in database
    const existingNode = await prisma.node.findUnique({
      where: { id: nodeId },
    });

    const currentData = (existingNode?.data || {}) as Record<string, unknown>;
    const updatedData = {
      ...currentData,
      botToken: cleanToken,
      botUsername,
      botName,
      secretToken,
      webhookUrl,
      webhookConnected: true,
      commandFilter: commandFilter?.trim() || "",
    };

    await prisma.node.update({
      where: { id: nodeId },
      data: {
        data: updatedData,
      },
    });

    return {
      success: true,
      botUsername,
      botName,
      webhookUrl,
    };
  } catch (error) {
    console.error("connectTelegramWebhook error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to connect webhook",
    };
  }
}

export interface DisconnectWebhookParams {
  nodeId: string;
  botToken?: string;
}

export async function disconnectTelegramWebhook({
  nodeId,
  botToken,
}: DisconnectWebhookParams) {
  try {
    const existingNode = await prisma.node.findUnique({
      where: { id: nodeId },
    });

    const currentData = (existingNode?.data || {}) as Record<string, unknown>;
    const token = botToken || (currentData.botToken as string);

    if (token) {
      // Delete webhook from Telegram
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
        method: "POST",
      });
    }

    const updatedData = {
      ...currentData,
      webhookConnected: false,
      secretToken: undefined,
    };

    await prisma.node.update({
      where: { id: nodeId },
      data: {
        data: updatedData,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("disconnectTelegramWebhook error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to disconnect webhook",
    };
  }
}
