import { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(`publish-loading-${nodeId}`, manualTriggerChannel.status, {
        nodeId,
        status: "loading",
    });

    const result = await step.run("manual-trigger", async () => context);

    await step.realtime.publish(`publish-success-${nodeId}`, manualTriggerChannel.status, {
        nodeId,
        status: "success",
    });

    return result;
};