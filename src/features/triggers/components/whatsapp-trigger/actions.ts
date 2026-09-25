"use server";

import crypto from "node:crypto";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";
import { WHATSAPP_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/whatsapp-trigger";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

export type WhatsAppTriggerToken = Realtime.Subscribe.Token<
  typeof WHATSAPP_TRIGGER_CHANNEL_NAME,
  string[]
>;

export async function fetchWhatsAppTriggerRealtimeToken(): Promise<WhatsAppTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: WHATSAPP_TRIGGER_CHANNEL_NAME,
    topics: ["status"],
  });

  return token;
}

export interface ConnectWhatsAppWebhookParams {
  workflowId: string;
  nodeId: string;
  accessToken: string;
  phoneNumberId: string;
  webhookBaseUrl: string;
}

export async function connectWhatsAppWebhook({
  workflowId,
  nodeId,
  accessToken,
  phoneNumberId,
  webhookBaseUrl,
}: ConnectWhatsAppWebhookParams) {
  const cleanToken = accessToken.trim();
  if (!cleanToken) {
    return { success: false, error: "Access token is required" };
  }

  const cleanPhoneNumberId = phoneNumberId.trim();
  if (!cleanPhoneNumberId) {
    return { success: false, error: "Phone Number ID is required" };
  }

  const cleanBaseUrl = webhookBaseUrl.trim().replace(/\/+$/, "");
  if (!cleanBaseUrl.startsWith("https://")) {
    return {
      success: false,
      error:
        "WhatsApp requires an HTTPS webhook URL. Please use an HTTPS URL or tunnel (e.g. ngrok).",
    };
  }

  try {
    // 1. Verify Access Token by calling the WhatsApp Business API
    const verifyRes = await fetch(
      `https://graph.facebook.com/v22.0/${cleanPhoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      },
    );
    const verifyData = await verifyRes.json();

    if (verifyData.error) {
      return {
        success: false,
        error:
          verifyData.error.message || "Invalid Access Token or Phone Number ID",
      };
    }

    const displayPhoneNumber =
      verifyData.display_phone_number || cleanPhoneNumberId;
    const verifiedName = verifyData.verified_name || "";

    // 2. Generate a random verify token for webhook verification handshake
    const verifyToken = crypto.randomBytes(24).toString("base64url");
    const webhookUrl = `${cleanBaseUrl}/api/webhooks/whatsapp?workflowId=${workflowId}`;

    // 3. Update node data in database
    const existingNode = await prisma.node.findUnique({
      where: { id: nodeId },
    });

    const currentData = (existingNode?.data || {}) as Record<string, unknown>;
    const updatedData = {
      ...currentData,
      accessToken: cleanToken,
      phoneNumberId: cleanPhoneNumberId,
      displayPhoneNumber,
      verifiedName,
      verifyToken,
      webhookUrl,
      webhookConnected: true,
    };

    await prisma.node.update({
      where: { id: nodeId },
      data: {
        data: updatedData,
      },
    });

    return {
      success: true,
      displayPhoneNumber,
      verifiedName,
      webhookUrl,
      verifyToken,
    };
  } catch (error) {
    console.error("connectWhatsAppWebhook error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to connect webhook",
    };
  }
}

export interface DisconnectWhatsAppWebhookParams {
  nodeId: string;
}

export async function disconnectWhatsAppWebhook({
  nodeId,
}: DisconnectWhatsAppWebhookParams) {
  try {
    const existingNode = await prisma.node.findUnique({
      where: { id: nodeId },
    });

    const currentData = (existingNode?.data || {}) as Record<string, unknown>;
    const updatedData = {
      ...currentData,
      webhookConnected: false,
      verifyToken: undefined,
    };

    await prisma.node.update({
      where: { id: nodeId },
      data: {
        data: updatedData,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("disconnectWhatsAppWebhook error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to disconnect webhook",
    };
  }
}
