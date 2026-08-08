"use client"

import { createId } from "@paralleldrive/cuid2"
import { Button } from "./ui/button"
import { NodeType } from "@/generated/prisma/enums";
import { GlobeIcon, MousePointer2Icon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";


export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger manually",
        description: "Starts the workflow when you manually run it",
        icon: MousePointer2Icon,
    }
];

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Make an HTTP request",
        icon: GlobeIcon,
    }
]

interface NodeSelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}


export function NodeSelector({ open, onOpenChange, children }: NodeSelectorProps) {
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
    const handleNodeSelect = useCallback((selection: NodeTypeOption) => {
        if (selection.type === NodeType.MANUAL_TRIGGER) {
            const nodes = getNodes();
            const hasManualTrigger = nodes.some(
                (node) => node.type === NodeType.MANUAL_TRIGGER,
            );
            if (hasManualTrigger) {
                toast.error("A workflow can only have one manual trigger.")
                return;
            }
        }
        setNodes((nodes) => {
            const hasInitialNode = nodes.some(
                (node) => node.type === NodeType.INITIAL,
            );
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const flowPosition = screenToFlowPosition
                ({
                    x: centerX + (Math.random() - 0.5) * 200,
                    y: centerY + (Math.random() - 0.5) * 200
                });

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: selection.type,
            };

            if (hasInitialNode) {
                return [newNode];
            }
            return [...nodes, newNode];
        });
        onOpenChange(false);
    }, [getNodes, onOpenChange, screenToFlowPosition, setNodes]);
    return (
        <Sheet open={open} onOpenChange={onOpenChange} >
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>What triggers  this workflow?</SheetTitle>
                    <SheetDescription>A Trigger is a step that starts your workflow.</SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNodes.map((nodeType) => {
                        const Icon = nodeType.icon;
                        return (
                            <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary" onClick={() => handleNodeSelect(nodeType)}>
                                <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <img src={Icon}
                                            alt={nodeType.label}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Separator />
                <div>
                    {executionNodes.map((nodeType) => {
                        const Icon = nodeType.icon;
                        return (
                            <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary" onClick={() => handleNodeSelect(nodeType)}>
                                <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <img src={Icon}
                                            alt={nodeType.label}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
}