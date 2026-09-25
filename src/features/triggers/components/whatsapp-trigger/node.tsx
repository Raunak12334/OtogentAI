"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { WHATSAPP_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/whatsapp-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchWhatsAppTriggerRealtimeToken } from "./actions";
import { WhatsAppTriggerDialog, type WhatsAppTriggerNodeData } from "./dialog";

type WhatsAppTriggerNodeType = Node<WhatsAppTriggerNodeData>;

export const WhatsAppTriggerNode = memo(
  (props: NodeProps<WhatsAppTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: WHATSAPP_TRIGGER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchWhatsAppTriggerRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const handleUpdateNodeData = (
      updatedData: Partial<WhatsAppTriggerNodeData>,
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
    const description = nodeData?.displayPhoneNumber
      ? `${nodeData.verifiedName || nodeData.displayPhoneNumber}`
      : "When a WhatsApp message arrives";

    return (
      <>
        <WhatsAppTriggerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          nodeId={props.id}
          data={nodeData}
          onUpdateNodeData={handleUpdateNodeData}
        />
        <BaseTriggerNode
          {...props}
          icon="/whatsapp.svg"
          name="WhatsApp"
          description={description}
          status={nodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

WhatsAppTriggerNode.displayName = "WhatsAppTriggerNode";
