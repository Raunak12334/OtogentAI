"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { TELEGRAM_ACTION_CHANNEL_NAME } from "@/inngest/channels/telegram-action";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchTelegramActionRealtimeToken } from "./actions";
import { TelegramActionDialog, type TelegramActionFormValues } from "./dialog";
import type { TelegramActionNodeData } from "./executor";

type TelegramActionNodeType = Node<TelegramActionNodeData>;

export const TelegramActionNode = memo(
  (props: NodeProps<TelegramActionNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: TELEGRAM_ACTION_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchTelegramActionRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: TelegramActionFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            };
          }
          return node;
        }),
      );
    };

    const nodeData = props.data;
    const description = nodeData?.chatId
      ? `To: ${nodeData.chatId}${nodeData.variableName ? ` -> ${nodeData.variableName}` : ""}`
      : "Send a Telegram message";

    return (
      <>
        <TelegramActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/telegram.svg"
          name="Send Telegram"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

TelegramActionNode.displayName = "TelegramActionNode";
