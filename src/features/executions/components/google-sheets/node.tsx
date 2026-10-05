"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { GOOGLE_SHEETS_CHANNEL_NAME } from "@/inngest/channels/google-sheets";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGoogleSheetsRealtimeToken } from "./actions";
import { GoogleSheetsDialog, type GoogleSheetsFormValues } from "./dialog";
import type { GoogleSheetsData } from "./executor";

type GoogleSheetsNodeType = Node<GoogleSheetsData>;

export const GoogleSheetsNode = memo((props: NodeProps<GoogleSheetsNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_SHEETS_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleSheetsRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GoogleSheetsFormValues) => {
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
  const description = nodeData?.spreadsheetId
    ? `${nodeData.sheetName || "Sheet1"}${nodeData.variableName ? ` → {{${nodeData.variableName}}}` : ""}`
    : "Not configured";

  return (
    <>
      <GoogleSheetsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/googlesheets.svg"
        name="Google Sheets"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GoogleSheetsNode.displayName = "GoogleSheetsNode";
