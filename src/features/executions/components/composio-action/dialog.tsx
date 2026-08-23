"use client";

import { useMemo, useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2Icon, ZapIcon } from "lucide-react";
import type { ComposioActionData } from "./executor";

export type ComposioActionFormValues = ComposioActionData;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ComposioActionFormValues) => void;
    defaultValues?: Partial<ComposioActionFormValues>;
}

export const ComposioActionDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const trpc = useTRPC();

    const toolkitSlug = defaultValues.toolkitSlug || "";
    const toolkitName = defaultValues.toolkitName || "App";
    const toolkitLogo = defaultValues.toolkitLogo || "";

    const [variableName, setVariableName] = useState(
        defaultValues.variableName || `${toolkitSlug || "action"}Result`
    );
    const [actionSlug, setActionSlug] = useState(
        defaultValues.actionSlug || ""
    );
    const [actionArguments, setActionArguments] = useState<Record<string, string>>(
        (defaultValues.actionArguments as Record<string, string>) || {}
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    // Fetch tools directly for the pre-filled toolkitSlug
    const { data: rawTools, isLoading: isLoadingTools } = useQuery({
        ...trpc.integrations.getTools.queryOptions(
            { toolkitSlug },
            { enabled: !!toolkitSlug && open }
        ),
    });

    const toolsList = useMemo(() => {
        if (!rawTools) return [];
        if (Array.isArray(rawTools)) return rawTools;
        if (Array.isArray((rawTools as { items?: unknown[] }).items)) {
            return (rawTools as { items: unknown[] }).items;
        }
        return [];
    }, [rawTools]);

    // Find selected tool schema
    const selectedTool = useMemo(() => {
        if (!actionSlug || !toolsList.length) return null;
        return (
            (toolsList as Array<{
                slug?: string;
                name?: string;
                description?: string;
                inputParameters?: {
                    properties?: Record<string, { description?: string; type?: string; title?: string }>;
                    required?: string[];
                    schema?: {
                        properties?: Record<string, { description?: string; type?: string; title?: string }>;
                        required?: string[];
                    };
                };
                parameters?: {
                    properties?: Record<string, { description?: string; type?: string; title?: string }>;
                    required?: string[];
                };
            }>).find((t) => t.slug === actionSlug) ?? null
        );
    }, [actionSlug, toolsList]);

    // Extract dynamic parameter fields from selected tool
    const toolParameters = useMemo(() => {
        if (!selectedTool) return [];
        const rawProps =
            selectedTool.inputParameters?.properties ||
            selectedTool.inputParameters?.schema?.properties ||
            selectedTool.parameters?.properties ||
            {};
        const requiredList =
            selectedTool.inputParameters?.required ||
            selectedTool.inputParameters?.schema?.required ||
            selectedTool.parameters?.required ||
            [];

        return Object.entries(rawProps).map(([key, prop]) => ({
            name: key,
            title: prop.title || key,
            description: prop.description || "",
            type: prop.type || "string",
            required: requiredList.includes(key),
        }));
    }, [selectedTool]);

    // Reset when dialog opens
    useEffect(() => {
        if (open) {
            setVariableName(
                defaultValues.variableName || `${toolkitSlug || "action"}Result`
            );
            setActionSlug(defaultValues.actionSlug || "");
            setActionArguments(
                (defaultValues.actionArguments as Record<string, string>) || {}
            );
            setValidationError(null);
        }
    }, [open, defaultValues, toolkitSlug]);

    const handleActionChange = (val: string) => {
        setActionSlug(val);
        setActionArguments({});
    };

    const handleArgumentChange = (paramName: string, value: string) => {
        setActionArguments((prev) => ({
            ...prev,
            [paramName]: value,
        }));
    };

    const handleSave = () => {
        if (!variableName.trim()) {
            setValidationError("Variable name is required");
            return;
        }
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(variableName)) {
            setValidationError(
                "Variable name must start with a letter/underscore and contain only letters, numbers, underscores"
            );
            return;
        }
        if (!actionSlug) {
            setValidationError("Please select an action to run");
            return;
        }

        setValidationError(null);
        onSubmit({
            variableName: variableName.trim(),
            toolkitSlug,
            toolkitName,
            toolkitLogo,
            actionSlug,
            actionArguments,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2.5">
                        {toolkitLogo ? (
                            <img
                                src={toolkitLogo}
                                alt={toolkitName}
                                className="size-6 object-contain rounded"
                            />
                        ) : (
                            <ZapIcon className="size-5" />
                        )}
                        <DialogTitle>Configure {toolkitName} Action</DialogTitle>
                    </div>
                    <DialogDescription>
                        Select and configure an action to execute in {toolkitName}.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-5 py-2">
                        {/* 1. Variable Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="variableName">Variable Name</Label>
                            <Input
                                id="variableName"
                                value={variableName}
                                onChange={(e) => setVariableName(e.target.value)}
                                placeholder="e.g. slackResponse"
                            />
                            <p className="text-xs text-muted-foreground">
                                Access this action output in later nodes via: {"{{"}{variableName}{"}}"}
                            </p>
                        </div>

                        {/* 2. Select Action / Tool */}
                        <div className="space-y-1.5">
                            <Label>Action</Label>
                            {isLoadingTools ? (
                                <div className="flex items-center text-sm text-muted-foreground gap-2 py-2">
                                    <Loader2Icon className="size-4 animate-spin" />
                                    Loading {toolkitName} actions...
                                </div>
                            ) : (
                                <Select
                                    value={actionSlug}
                                    onValueChange={handleActionChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select a ${toolkitName} action...`} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {(toolsList as Array<{ slug: string; name?: string; description?: string }>).map((tool) => (
                                            <SelectItem
                                                key={tool.slug}
                                                value={tool.slug}
                                            >
                                                <div className="flex flex-col text-left py-0.5 max-w-md">
                                                    <span className="font-medium text-sm">
                                                        {tool.name || tool.slug}
                                                    </span>
                                                    {tool.description && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {tool.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* 3. Dynamic Parameter Fields */}
                        {selectedTool && toolParameters.length > 0 && (
                            <div className="space-y-3 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">Action Parameters</Label>
                                    <span className="text-xs text-muted-foreground">
                                        Supports {"{{variable}}"} variables
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {toolParameters.map((param) => (
                                        <div key={param.name} className="space-y-1">
                                            <Label
                                                htmlFor={`param-${param.name}`}
                                                className="text-xs font-medium flex items-center gap-1"
                                            >
                                                {param.title}
                                                {param.required && (
                                                    <span className="text-destructive">*</span>
                                                )}
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    ({param.name})
                                                </span>
                                            </Label>
                                            <Input
                                                id={`param-${param.name}`}
                                                value={actionArguments[param.name] || ""}
                                                onChange={(e) =>
                                                    handleArgumentChange(
                                                        param.name,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={
                                                    param.description ||
                                                    `Enter ${param.title}...`
                                                }
                                            />
                                            {param.description && (
                                                <p className="text-[11px] text-muted-foreground line-clamp-2">
                                                    {param.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {validationError && (
                            <p className="text-xs font-medium text-destructive">
                                {validationError}
                            </p>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-4 pt-3 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Action</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
