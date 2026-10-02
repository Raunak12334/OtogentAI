"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { GOOGLE_SLIDES_CHANNEL_NAME } from "@/inngest/channels/google-slides";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGoogleSlidesRealtimeToken } from "./actions";
import { GoogleSlidesDialog, type GoogleSlidesFormValues } from "./dialog";
import type { GoogleSlidesNodeData } from "./executor";

type GoogleSlidesNodeType = Node<GoogleSlidesNodeData>;

export const GoogleSlidesNode = memo((props: NodeProps<GoogleSlidesNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_SLIDES_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleSlidesRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GoogleSlidesFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return { ...node, data: { ...node.data, ...values } };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.presentationId
    ? `Updates slides → {{${nodeData.variableName || "slidesResult"}}}`
    : "Not configured";

  return (
    <>
      <GoogleSlidesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/googleslides.svg"
        name="Google Slides"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GoogleSlidesNode.displayName = "GoogleSlidesNode";
