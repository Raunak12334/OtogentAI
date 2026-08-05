"use client"

import { SettingsIcon, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { NodeToolbar, Position } from "@xyflow/react";

interface WorkflowNodeProps {
    children?: React.ReactNode;
    showToolbar?: boolean;
    onDelete?: () => void;
    onSettings?: () => void;
    name?: string;
    description?: string;
}

export function WorkflowNode({
    children,
    showToolbar = true,
    onDelete,
    onSettings,
    name,
    description,
}: WorkflowNodeProps) {
    return (
        <>
            {showToolbar && (
                <NodeToolbar>
                    <Button size="icon-sm" variant="ghost" onClick={onSettings}>
                        <SettingsIcon className="size-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={onDelete}>
                        <TrashIcon className="size-4" />
                    </Button>
                </NodeToolbar>
            )}
            {children}
            {name && (
                <NodeToolbar position={Position.Bottom} isVisible className="max-w-50 text-center">
                    <p className="font-medium">{name}</p>
                    {description && <p className="text-muted-foreground tuncate text-sm">{description}</p>}
                </NodeToolbar>
            )}
        </>
    );
};