import { NodeType } from "@/generated/prisma/client";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "@/features/executions/components/http-request/executor";
import { composioActionExecutor } from "@/features/executions/components/composio-action/executor";
import { openaiExecutor } from "@/features/executions/components/openai/executor";
import { anthropicExecutor } from "@/features/executions/components/anthropic/executor";
import { geminiExecutor } from "@/features/executions/components/gemini/executor";

export const executorRegistry: Partial<Record<NodeType, NodeExecutor>> = {
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: httpRequestExecutor,
    [NodeType.COMPOSIO_ACTION]: composioActionExecutor,
    [NodeType.OPENAI]: openaiExecutor,
    [NodeType.ANTHROPIC]: anthropicExecutor,
    [NodeType.GEMINI]: geminiExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type];
    if (!executor) {
        throw new Error(`No executor found for node type: ${type}`);
    }
    return executor;
};
