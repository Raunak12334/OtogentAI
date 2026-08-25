"use client";

import { memo } from "react";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { type NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";

interface BaseTriggerNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: React.ReactNode;
    status?: NodeStatus;
    onSettings?: () => void;
    onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    status = "initial",
}: BaseTriggerNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const handleDelete = () => {
        setNodes((currentNodes) => {
            const updateNodes = currentNodes.filter((node) => node.id !== id);
            return updateNodes;
        });
        setEdges((currentEdges) => {
            const updateEdges = currentEdges.filter(
                (edge) => edge.source !== id && edge.target !== id
            );
            return updateEdges;
        });
    };
    return (
        <WorkflowNode
            name={name}
            description={description}
            onSettings={onSettings}
            onDelete={handleDelete}
        >
            <NodeStatusIndicator
                status={status}
                variant="border"
            >
                <BaseNode status={status} onDoubleClick={onDoubleClick} className="rounded-l-2xl relative group">
                    <BaseNodeContent>
                        {typeof Icon === "string" ? (
                            <img src={Icon} alt={name} className="size-4 object-contain" />
                        ) : (
                            <Icon className="size-4 text-muted-foreground" />
                        )}
                        {children}
                        <BaseHandle
                            id="source-1"
                            type="source"
                            position={Position.Right}
                        />
                    </BaseNodeContent>
                </BaseNode>
            </NodeStatusIndicator>
        </WorkflowNode>
    );
});

BaseTriggerNode.displayName = "BaseTriggerNode";