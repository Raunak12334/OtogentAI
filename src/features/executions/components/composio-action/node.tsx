"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { ComposioActionDialog, type ComposioActionFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchComposioActionRealtimeToken } from "./actions";
import { COMPOSIO_ACTION_CHANNEL_NAME } from "@/inngest/channels/composio-action";
import type { ComposioActionData } from "./executor";
import { ZapIcon } from "lucide-react";

type ComposioActionNodeType = Node<ComposioActionData>;

export const ComposioActionNode = memo(
    (props: NodeProps<ComposioActionNodeType>) => {
        const [dialogOpen, setDialogOpen] = useState(false);
        const { setNodes } = useReactFlow();

        const nodeStatus = useNodeStatus({
            nodeId: props.id,
            channel: COMPOSIO_ACTION_CHANNEL_NAME,
            topic: "status",
            refreshToken: fetchComposioActionRealtimeToken,
        });

        const handleOpenSettings = () => setDialogOpen(true);

        const handleSubmit = (values: ComposioActionFormValues) => {
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
                })
            );
        };

        const nodeData = props.data;
        const nodeName = nodeData?.toolkitName || "App Action";
        const nodeIcon = nodeData?.toolkitLogo || ZapIcon;
        const description = nodeData?.actionSlug
            ? nodeData.actionSlug
            : "Not configured";

        return (
            <>
                <ComposioActionDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    defaultValues={nodeData}
                />
                <BaseExecutionNode
                    {...props}
                    id={props.id}
                    icon={nodeIcon}
                    name={nodeName}
                    status={nodeStatus}
                    description={description}
                    onSettings={handleOpenSettings}
                    onDoubleClick={handleOpenSettings}
                />
            </>
        );
    }
);

ComposioActionNode.displayName = "ComposioActionNode";
