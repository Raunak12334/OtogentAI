import { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(`publish-loading-${nodeId}`, stripeTriggerChannel.status, {
        nodeId,
        status: "loading",
    });

    const result = await step.run("stripe-trigger", async () => context);

    await step.realtime.publish(`publish-success-${nodeId}`, stripeTriggerChannel.status, {
        nodeId,
        status: "success",
    });

    return result;
};