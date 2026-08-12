import { NodeExecutor } from "@/features/executions/types";
import { step } from "inngest";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({ data, nodeId, context, step }) => {
    const result = await step.run("manual-trigger", async () => context);

    return result;
}