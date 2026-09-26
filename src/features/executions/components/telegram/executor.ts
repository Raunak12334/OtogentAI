import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { NodeType } from "@/generated/prisma/client";
import { telegramActionChannel } from "@/inngest/channels/telegram-action";
import prisma from "@/lib/db";

export type TelegramActionNodeData = {
  variableName?: string;
  authType?: "inherit" | "credential" | "custom";
  credentialId?: string;
  botToken?: string;
  chatId?: string;
  text?: string;
  parseMode?: "HTML" | "MarkdownV2" | "Markdown" | "None";
  [key: string]: unknown;
};

export const telegramActionExecutor: NodeExecutor<
  TelegramActionNodeData
> = async ({ data, nodeId, context, step }) => {
  await step.realtime.publish(
    `publish-loading-${nodeId}`,
    telegramActionChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    const result = await step.run(
      `telegram-${data.variableName || nodeId}`,
      async () => {
        if (!data.variableName) {
          await step.realtime.publish(
            `publish-error-${nodeId}`,
            telegramActionChannel.status,
            {
              nodeId,
              status: "error",
            },
          );
          throw new NonRetriableError(
            "Telegram node: Variable name not configured",
          );
        }

        let botToken = data.botToken?.trim();

        if (data.authType === "credential") {
          if (!data.credentialId) {
            throw new NonRetriableError(
              "Telegram node: No credential selected",
            );
          }
          const credential = await prisma.credential.findUnique({
            where: { id: data.credentialId },
          });
          if (!credential?.value) {
            throw new NonRetriableError(
              "Telegram node: Credential not found or empty",
            );
          }
          botToken = credential.value;
        } else if (!botToken || data.authType === "inherit") {
          // Look for a Telegram trigger node in the same workflow
          const currentNode = await prisma.node.findUnique({
            where: { id: nodeId },
            select: { workflowId: true },
          });

          if (currentNode?.workflowId) {
            const triggerNode = await prisma.node.findFirst({
              where: {
                workflowId: currentNode.workflowId,
                type: NodeType.TELEGRAM_TRIGGER,
              },
            });
            const triggerData = (triggerNode?.data || {}) as {
              botToken?: string;
            };
            if (triggerData.botToken) {
              botToken = triggerData.botToken.trim();
            }
          }
        }

        if (!botToken) {
          throw new NonRetriableError(
            "Telegram node: Bot token not found. Please provide a token or add a configured Telegram Trigger node.",
          );
        }

        if (!data.chatId) {
          throw new NonRetriableError("Telegram node: Chat ID is required");
        }

        if (!data.text) {
          throw new NonRetriableError(
            "Telegram node: Message text is required",
          );
        }

        // Interpolate Chat ID and Message Text using Handlebars
        const compiledChatId = Handlebars.compile(data.chatId)(context).trim();
        const compiledText = Handlebars.compile(data.text)(context);

        if (!compiledChatId) {
          throw new NonRetriableError(
            "Telegram node: Evaluated Chat ID is empty",
          );
        }

        const payload: Record<string, unknown> = {
          chat_id: compiledChatId,
          text: compiledText,
        };

        if (data.parseMode && data.parseMode !== "None") {
          payload.parse_mode = data.parseMode;
        }

        const res = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const responseData = await res.json();

        if (!responseData.ok) {
          throw new NonRetriableError(
            `Telegram API Error: ${responseData.description || "Failed to send message"}`,
          );
        }

        return {
          messageId: responseData.result.message_id,
          chatId: responseData.result.chat.id,
          date: responseData.result.date,
          text: responseData.result.text,
          status: "sent",
        };
      },
    );

    await step.realtime.publish(
      `publish-success-${nodeId}`,
      telegramActionChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [data.variableName || "telegramResponse"]: result,
    };
  } catch (error) {
    await step.realtime.publish(
      `publish-error-${nodeId}`,
      telegramActionChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw error;
  }
};
