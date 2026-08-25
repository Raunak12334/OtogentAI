"use client";

import { createId } from "@paralleldrive/cuid2";
import { Button } from "./ui/button";
import { NodeType } from "@/generated/prisma/enums";
import { GlobeIcon, MousePointer2Icon, PlugZapIcon } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
    initialData?: Record<string, unknown>;
};

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger manually",
        description: "Starts the workflow when you manually run it",
        icon: MousePointer2Icon,
    },
];

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Make an HTTP request",
        icon: GlobeIcon,
    },
    {
        type: NodeType.OPENAI,
        label: "OpenAI",
        description: "Generate text and reason with OpenAI models",
        icon: "/openai.svg",
        initialData: {
            model: "gpt-4o-mini",
        },
    },
    {
        type: NodeType.ANTHROPIC,
        label: "Anthropic",
        description: "Generate text and analyze with Claude models",
        icon: "/anthropic.svg",
        initialData: {
            model: "claude-3-5-sonnet-latest",
        },
    },
    {
        type: NodeType.GEMINI,
        label: "Google Gemini",
        description: "Generate text and multimodal reasoning with Gemini",
        icon: "/gemini.svg",
        initialData: {
            model: "gemini-2.0-flash",
        },
    },
];

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function NodeSelector({ open, onOpenChange, children }: NodeSelectorProps) {
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
    const trpc = useTRPC();

    const { data: connectedAccounts } = useQuery({
        ...trpc.integrations.getConnectedAccounts.queryOptions(),
        enabled: open,
    });

    const { data: toolkits } = useQuery({
        ...trpc.integrations.getToolkits.queryOptions(),
        enabled: open,
    });

    // Match connected accounts with toolkits to build app-specific node options
    const connectedAppNodes = useMemo(() => {
        if (!connectedAccounts?.items || !toolkits) return [];

        const activeSlugs = new Set(
            connectedAccounts.items
                .filter((a) => !a.status || a.status === "ACTIVE")
                .map((a) => (a.toolkit?.slug ?? (a as { toolkitSlug?: string }).toolkitSlug)?.toLowerCase())
                .filter((s): s is string => Boolean(s))
        );

        return toolkits
            .filter((tk: { slug: string }) => activeSlugs.has(tk.slug.toLowerCase()))
            .map((tk: { slug: string; name: string; meta?: { logo?: string; description?: string } }): NodeTypeOption => ({
                type: NodeType.COMPOSIO_ACTION,
                label: tk.name,
                description: `Run an action in ${tk.name}`,
                icon: tk.meta?.logo || "",
                initialData: {
                    toolkitSlug: tk.slug,
                    toolkitName: tk.name,
                    toolkitLogo: tk.meta?.logo || "",
                },
            }));
    }, [connectedAccounts, toolkits]);

    const handleNodeSelect = useCallback(
        (selection: NodeTypeOption) => {
            if (selection.type === NodeType.MANUAL_TRIGGER) {
                const nodes = getNodes();
                const hasManualTrigger = nodes.some(
                    (node) => node.type === NodeType.MANUAL_TRIGGER
                );
                if (hasManualTrigger) {
                    toast.error("A workflow can only have one manual trigger.");
                    return;
                }
            }
            setNodes((nodes) => {
                const hasInitialNode = nodes.some(
                    (node) => node.type === NodeType.INITIAL
                );
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const flowPosition = screenToFlowPosition({
                    x: centerX + (Math.random() - 0.5) * 200,
                    y: centerY + (Math.random() - 0.5) * 200,
                });

                const newNode = {
                    id: createId(),
                    data: selection.initialData || {},
                    position: flowPosition,
                    type: selection.type,
                };

                if (hasInitialNode) {
                    return [newNode];
                }
                return [...nodes, newNode];
            });
            onOpenChange(false);
        },
        [getNodes, onOpenChange, screenToFlowPosition, setNodes]
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add a Node</SheetTitle>
                    <SheetDescription>
                        Select a trigger or action to add to your workflow.
                    </SheetDescription>
                </SheetHeader>

                <div>
                    {triggerNodes.map((nodeType) => {
                        const Icon = nodeType.icon;
                        return (
                            <div
                                key={nodeType.type}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <img
                                            src={Icon}
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
                            <div
                                key={nodeType.type}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <img
                                            src={Icon}
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

                    {/* Connected Composio Integrations rendered as first-class nodes */}
                    {connectedAppNodes.map((nodeType) => {
                        const Icon = nodeType.icon;
                        return (
                            <div
                                key={nodeType.label}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center gap-6 w-full overflow-hidden">
                                    {typeof Icon === "string" && Icon ? (
                                        <img
                                            src={Icon}
                                            alt={nodeType.label}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <PlugZapIcon className="size-5" />
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

                    {connectedAppNodes.length === 0 && (
                        <div className="p-4">
                            <Link
                                href="/integrations"
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-2.5 p-3 text-xs text-muted-foreground hover:text-foreground border border-dashed rounded-lg transition-colors"
                            >
                                <PlugZapIcon className="size-4 shrink-0 text-primary" />
                                <span>Connect Notion, Slack, Gmail & more in <strong>Integrations</strong> to add them here</span>
                            </Link>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
