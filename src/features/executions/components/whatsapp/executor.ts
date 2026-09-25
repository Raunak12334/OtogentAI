import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { NodeType } from "@/generated/prisma/client";
import { whatsappActionChannel } from "@/inngest/channels/whatsapp-action";
import prisma from "@/lib/db";

export type WhatsAppActionNodeData = {
  variableName?: string;
  authType?: "inherit" | "credential" | "custom";
  credentialId?: string;
  accessToken?: string;
  phoneNumberId?: string;
  recipientPhone?: string;
  text?: string;
  [key: string]: unknown;
};

export const whatsappActionExecutor: NodeExecutor<
  WhatsAppActionNodeData
> = async ({ data, nodeId, context, step }) => {
  await step.realtime.publish(
    `publish-loading-${nodeId}`,
    whatsappActionChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    const result = await step.run(
      `whatsapp-${data.variableName || nodeId}`,
      async () => {
        if (!data.variableName) {
          await step.realtime.publish(
            `publish-error-${nodeId}`,
            whatsappActionChannel.status,
            {
              nodeId,
              status: "error",
            },
          );
          throw new NonRetriableError(
            "WhatsApp node: Variable name not configured",
          );
        }

        let accessToken = data.accessToken?.trim();
        let phoneNumberId = data.phoneNumberId?.trim();

        if (data.authType === "credential") {
          if (!data.credentialId) {
            throw new NonRetriableError(
              "WhatsApp node: No credential selected",
            );
          }
          const credential = await prisma.credential.findUnique({
            where: { id: data.credentialId },
          });
          if (!credential?.value) {
            throw new NonRetriableError(
              "WhatsApp node: Credential not found or empty",
            );
          }
          accessToken = credential.value;
        } else if (!accessToken || data.authType === "inherit") {
          // Look for a WhatsApp trigger node in the same workflow
          const currentNode = await prisma.node.findUnique({
            where: { id: nodeId },
            select: { workflowId: true },
          });

          if (currentNode?.workflowId) {
            const triggerNode = await prisma.node.findFirst({
              where: {
                workflowId: currentNode.workflowId,
                type: NodeType.WHATSAPP_TRIGGER,
              },
            });
            const triggerData = (triggerNode?.data || {}) as {
              accessToken?: string;
              phoneNumberId?: string;
            };
            if (triggerData.accessToken) {
              accessToken = triggerData.accessToken.trim();
            }
            if (!phoneNumberId && triggerData.phoneNumberId) {
              phoneNumberId = triggerData.phoneNumberId.trim();
            }
          }
        }

        if (!accessToken) {
          throw new NonRetriableError(
            "WhatsApp node: Access token not found. Please provide a token or add a configured WhatsApp Trigger node.",
          );
        }

        if (!phoneNumberId) {
          throw new NonRetriableError(
            "WhatsApp node: Phone Number ID is required",
          );
        }

        if (!data.recipientPhone) {
          throw new NonRetriableError(
            "WhatsApp node: Recipient phone number is required",
          );
        }

        if (!data.text) {
          throw new NonRetriableError(
            "WhatsApp node: Message text is required",
          );
        }

        // Interpolate recipient phone and message text using Handlebars
        const compiledRecipient = Handlebars.compile(data.recipientPhone)(
          context,
        ).trim();
        const compiledText = Handlebars.compile(data.text)(context);

        if (!compiledRecipient) {
          throw new NonRetriableError(
            "WhatsApp node: Evaluated recipient phone is empty",
          );
        }

        // Send message via WhatsApp Cloud API
        const res = await fetch(
          `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: compiledRecipient,
              type: "text",
              text: {
                body: compiledText,
              },
            }),
          },
        );

        const responseData = await res.json();

        if (responseData.error) {
          throw new NonRetriableError(
            `WhatsApp API Error: ${responseData.error.message || "Failed to send message"}`,
          );
        }

        return {
          messageId: responseData.messages?.[0]?.id || "",
          recipientPhone: compiledRecipient,
          status: responseData.messages?.[0]?.message_status || "sent",
        };
      },
    );

    await step.realtime.publish(
      `publish-success-${nodeId}`,
      whatsappActionChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [data.variableName || "whatsappResponse"]: result,
    };
  } catch (error) {
    await step.realtime.publish(
      `publish-error-${nodeId}`,
      whatsappActionChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw error;
  }
};
