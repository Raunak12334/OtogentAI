"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { POWERPOINT_CHANNEL_NAME } from "@/inngest/channels/powerpoint";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchPowerPointRealtimeToken } from "./actions";
import { PowerPointDialog, type PowerPointFormValues } from "./dialog";
import type { PowerPointNodeData } from "./executor";

type PowerPointNodeType = Node<PowerPointNodeData>;

export const PowerPointNode = memo((props: NodeProps<PowerPointNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: POWERPOINT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchPowerPointRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: PowerPointFormValues) => {
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
  const description = nodeData?.variableName
    ? `${nodeData.theme || "modern-dark"} -> {{${nodeData.variableName}}}`
    : "Generate .pptx presentation";

  return (
    <>
      <PowerPointDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/powerpoint.svg"
        name="PowerPoint (PPTX)"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

PowerPointNode.displayName = "PowerPointNode";
