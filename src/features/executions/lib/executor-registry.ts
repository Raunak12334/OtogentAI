import { anthropicExecutor } from "@/features/executions/components/anthropic/executor";
import { composioActionExecutor } from "@/features/executions/components/composio-action/executor";
import { geminiExecutor } from "@/features/executions/components/gemini/executor";
import { httpRequestExecutor } from "@/features/executions/components/http-request/executor";
import { openaiExecutor } from "@/features/executions/components/openai/executor";
import { telegramActionExecutor } from "@/features/executions/components/telegram/executor";
import { whatsappActionExecutor } from "@/features/executions/components/whatsapp/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { telegramTriggerExecutor } from "@/features/triggers/components/telegram-trigger/executor";
import { whatsappTriggerExecutor } from "@/features/triggers/components/whatsapp-trigger/executor";
import { NodeType } from "@/generated/prisma/client";
import type { NodeExecutor } from "../types";

export const executorRegistry: Partial<Record<NodeType, NodeExecutor>> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.COMPOSIO_ACTION]: composioActionExecutor,
  [NodeType.OPENAI]: openaiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.TELEGRAM_TRIGGER]: telegramTriggerExecutor,
  [NodeType.TELEGRAM_ACTION]: telegramActionExecutor,
  [NodeType.WHATSAPP_TRIGGER]: whatsappTriggerExecutor,
  [NodeType.WHATSAPP_ACTION]: whatsappActionExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};

