import type { NodeExecutor } from "@/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

type GoogleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecutor: NodeExecutor<
  GoogleFormTriggerData
> = async ({ nodeId, context, step }) => {
  await step.realtime.publish(
    `publish-loading-${nodeId}`,
    googleFormTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    const result = await step.run("google-form-trigger", async () => context);

    await step.realtime.publish(
      `publish-success-${nodeId}`,
      googleFormTriggerChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `publish-error-${nodeId}`,
      googleFormTriggerChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw error;
  }
};
