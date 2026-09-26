import type { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { ComposioActionNode } from "@/features/executions/components/composio-action/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { OpenAINode } from "@/features/executions/components/openai/node";
import { TelegramActionNode } from "@/features/executions/components/telegram/node";
import { WhatsAppActionNode } from "@/features/executions/components/whatsapp/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { TelegramTriggerNode } from "@/features/triggers/components/telegram-trigger/node";
import { WhatsAppTriggerNode } from "@/features/triggers/components/whatsapp-trigger/node";
import { NodeType } from "@/generated/prisma/enums";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.COMPOSIO_ACTION]: ComposioActionNode,
  [NodeType.OPENAI]: OpenAINode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.TELEGRAM_TRIGGER]: TelegramTriggerNode,
  [NodeType.TELEGRAM_ACTION]: TelegramActionNode,
  [NodeType.WHATSAPP_TRIGGER]: WhatsAppTriggerNode,
  [NodeType.WHATSAPP_ACTION]: WhatsAppActionNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;
