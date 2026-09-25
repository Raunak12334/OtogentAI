import { type NextRequest, NextResponse } from "next/server";
import { NodeType } from "@/generated/prisma/client";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";

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

    // Find the Telegram trigger node for this workflow
    const node = await prisma.node.findFirst({
      where: {
        workflowId,
        type: NodeType.TELEGRAM_TRIGGER,
      },
    });

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow or Telegram trigger node not found",
        },
        { status: 404 },
      );
    }

    const nodeData = (node.data || {}) as {
      secretToken?: string;
      commandFilter?: string;
      botToken?: string;
    };

    // Authenticate secret token if configured
    const secretTokenHeader = request.headers.get(
      "x-telegram-bot-api-secret-token",
    );
    if (nodeData.secretToken && secretTokenHeader !== nodeData.secretToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid secret token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const msg = body.message || body.channel_post || body.edited_message;

    if (!msg) {
      // Acknowledge updates without message/post payload so Telegram stops retrying
      return NextResponse.json(
        {
          success: true,
          ignored: true,
          message: "No message or channel_post in update",
        },
        { status: 200 },
      );
    }

    const rawText = msg.text || msg.caption || "";

    // Check optional command filter
    if (nodeData.commandFilter && nodeData.commandFilter.trim().length > 0) {
      const filter = nodeData.commandFilter.trim().toLowerCase();
      const textLower = rawText.trim().toLowerCase();
      const matches =
        textLower === filter || textLower.startsWith(`${filter} `);

      if (!matches) {
        return NextResponse.json(
          {
            success: true,
            filtered: true,
            message: "Update skipped by command filter",
          },
          { status: 200 },
        );
      }
    }

    let command = "";
    let commandArgs = "";
    if (rawText.startsWith("/")) {
      const parts = rawText.trim().split(/\s+/);
      command = parts[0];
      commandArgs = parts.slice(1).join(" ");
    }

    let fileId = "";
    if (Array.isArray(msg.photo) && msg.photo.length > 0) {
      fileId = msg.photo[msg.photo.length - 1]?.file_id || "";
    } else if (msg.document?.file_id) {
      fileId = msg.document.file_id;
    }

    let filePath = "";
    let fileUrl = "";
    if (fileId && nodeData.botToken) {
      try {
        const fileRes = await fetch(
          `https://api.telegram.org/bot${nodeData.botToken}/getFile?file_id=${fileId}`
        );
        if (fileRes.ok) {
          const fileJson = await fileRes.json();
          if (fileJson.ok && fileJson.result?.file_path) {
            filePath = fileJson.result.file_path;
            fileUrl = `https://api.telegram.org/file/bot${nodeData.botToken}/${filePath}`;
          }
        }
      } catch (err) {
        console.error("Failed to fetch Telegram file URL:", err);
      }
    }

    const telegramData = {
      messageId: msg.message_id,
      chatId: String(msg.chat.id),
      chatType: msg.chat.type,
      chatTitle: msg.chat.title || "",
      text: rawText,
      command,
      commandArgs,
      fileId,
      filePath,
      fileUrl,
      sender: {
        id: msg.from?.id,
        username: msg.from?.username || "",
        firstName: msg.from?.first_name || "",
        lastName: msg.from?.last_name || "",
        isBot: Boolean(msg.from?.is_bot),
      },
      timestamp: msg.date,
      raw: body,
    };

    // Trigger workflow execution via Inngest
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        telegram: telegramData,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Telegram update" },
      { status: 500 },
    );
  }
}
