"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { WHATSAPP_ACTION_CHANNEL_NAME } from "@/inngest/channels/whatsapp-action";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchWhatsAppActionRealtimeToken } from "./actions";
import { WhatsAppActionDialog, type WhatsAppActionFormValues } from "./dialog";
import type { WhatsAppActionNodeData } from "./executor";

type WhatsAppActionNodeType = Node<WhatsAppActionNodeData>;

export const WhatsAppActionNode = memo(
  (props: NodeProps<WhatsAppActionNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: WHATSAPP_ACTION_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchWhatsAppActionRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: WhatsAppActionFormValues) => {
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
    const description = nodeData?.recipientPhone
      ? `To: ${nodeData.recipientPhone}${nodeData.variableName ? ` -> ${nodeData.variableName}` : ""}`
      : "Send a WhatsApp message";

    return (
      <>
        <WhatsAppActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/whatsapp.svg"
          name="Send WhatsApp"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

WhatsAppActionNode.displayName = "WhatsAppActionNode";
