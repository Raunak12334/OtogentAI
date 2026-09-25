import { type NextRequest, NextResponse } from "next/server";
import { NodeType } from "@/generated/prisma/client";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";

/**
 * GET handler — WhatsApp webhook verification handshake.
 *
 * Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge
 * query parameters. We verify the token against the stored node data and echo
 * back the challenge to complete the subscription.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const workflowId = url.searchParams.get("workflowId");

    if (mode !== "subscribe" || !token || !challenge) {
      return NextResponse.json(
        { success: false, error: "Invalid verification request" },
        { status: 400 },
      );
    }

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter: workflowId",
        },
        { status: 400 },
      );
    }

    // Find the WhatsApp trigger node for this workflow
    const node = await prisma.node.findFirst({
      where: {
        workflowId,
        type: NodeType.WHATSAPP_TRIGGER,
      },
    });

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow or WhatsApp trigger node not found",
        },
        { status: 404 },
      );
    }

    const nodeData = (node.data || {}) as { verifyToken?: string };

    // Verify the token matches
    if (!nodeData.verifyToken || nodeData.verifyToken !== token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid verify token" },
        { status: 403 },
      );
    }

    // Echo back the challenge to complete verification
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("WhatsApp webhook verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify webhook" },
      { status: 500 },
    );
  }
}

/**
 * POST handler — Incoming WhatsApp message processing.
 *
 * Meta sends webhook events as POST requests. We extract the message payload,
 * build the context object, and trigger the workflow execution.
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter: workflowId",
        },
        { status: 400 },
      );
    }

    // Find the WhatsApp trigger node for this workflow
    const node = await prisma.node.findFirst({
      where: {
        workflowId,
        type: NodeType.WHATSAPP_TRIGGER,
      },
    });

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow or WhatsApp trigger node not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    // WhatsApp Cloud API webhook payload structure:
    // { object: "whatsapp_business_account", entry: [{ changes: [{ value: { messages: [...] } }] }] }
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json(
        {
          success: true,
          ignored: true,
          message: "Not a WhatsApp Business Account event",
        },
        { status: 200 },
      );
    }

    const entries = body.entry;
    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { success: true, ignored: true, message: "No entries in payload" },
        { status: 200 },
      );
    }

    // Process the first entry/change that contains messages
    for (const entry of entries) {
      const changes = entry.changes;
      if (!changes) continue;

      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value;
        if (!value?.messages || value.messages.length === 0) continue;

        const message = value.messages[0];
        const contact =
          value.contacts && value.contacts.length > 0
            ? value.contacts[0]
            : null;

        // Only process text messages for now
        const messageText =
          message.type === "text" ? message.text?.body || "" : "";

        const whatsappData = {
          messageId: message.id || "",
          from: message.from || "",
          text: messageText,
          type: message.type || "text",
          timestamp: message.timestamp || "",
          name: contact?.profile?.name || "",
          phoneNumberId: value.metadata?.phone_number_id || "",
          displayPhoneNumber: value.metadata?.display_phone_number || "",
          raw: body,
        };

        // Trigger workflow execution
        await sendWorkflowExecution({
          workflowId,
          initialData: {
            whatsapp: whatsappData,
          },
        });

        // Only process the first message
        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    // No messages found, but acknowledge the event
    return NextResponse.json(
      {
        success: true,
        ignored: true,
        message: "No processable messages in payload",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process WhatsApp update" },
      { status: 500 },
    );
  }
}
