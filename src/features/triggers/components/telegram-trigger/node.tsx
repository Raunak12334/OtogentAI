"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { TELEGRAM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/telegram-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchTelegramTriggerRealtimeToken } from "./actions";
import { TelegramTriggerDialog, type TelegramTriggerNodeData } from "./dialog";

type TelegramTriggerNodeType = Node<TelegramTriggerNodeData>;

export const TelegramTriggerNode = memo(
  (props: NodeProps<TelegramTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: TELEGRAM_TRIGGER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchTelegramTriggerRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleUpdateNodeData = (
      updatedData: Partial<TelegramTriggerNodeData>,
    ) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedData,
              },
            };
          }
          return node;
        }),
      );
    };

    const nodeData = props.data;
    const description = nodeData?.botUsername
      ? `@${nodeData.botUsername}${nodeData.commandFilter ? ` (${nodeData.commandFilter})` : ""}`
      : "When a Telegram message arrives";

    return (
      <>
        <TelegramTriggerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          nodeId={props.id}
          data={nodeData}
          onUpdateNodeData={handleUpdateNodeData}
        />
        <BaseTriggerNode
          {...props}
          icon="/telegram.svg"
          name="Telegram"
          description={description}
          status={nodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

TelegramTriggerNode.displayName = "TelegramTriggerNode";
