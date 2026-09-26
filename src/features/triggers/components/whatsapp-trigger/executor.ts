import type { NodeExecutor } from "@/features/executions/types";
import { whatsappTriggerChannel } from "@/inngest/channels/whatsapp-trigger";

type WhatsAppTriggerData = Record<string, unknown>;

export const whatsappTriggerExecutor: NodeExecutor<
  WhatsAppTriggerData
> = async ({ nodeId, context, step }) => {
  await step.realtime.publish(
    `publish-loading-${nodeId}`,
    whatsappTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  const result = await step.run("whatsapp-trigger", async () => context);

  await step.realtime.publish(
    `publish-success-${nodeId}`,
    whatsappTriggerChannel.status,
    {
      nodeId,
      status: "success",
    },
  );

  return result;
};
