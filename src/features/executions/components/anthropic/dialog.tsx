"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CredentialType } from "@/generated/prisma/enums";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import Link from "next/link";
import Image from "next/image";

export const ANTHROPIC_MODELS = [
    { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet (Most Capable)" },
    { value: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku (Fast & Efficient)" },
    { value: "claude-3-opus-latest", label: "Claude 3 Opus (Complex Analysis)" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
] as const;

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message:
                "Variable name must start with a letter or underscore and can contain only letters, numbers, and underscores",
        }),
    credentialId: z.string().min(1, { message: "Credential is required" }),
    model: z.string().min(1, { message: "Model is required" }),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, { message: "User prompt is required" }),
});

export type AnthropicFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: AnthropicFormValues) => void;
    defaultValues?: Partial<AnthropicFormValues>;
}

export const AnthropicDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const trpc = useTRPC();
    const { data: credentials, isLoading: isLoadingCredentials } = useQuery({
        ...trpc.credentials.getByType.queryOptions({
            type: CredentialType.ANTHROPIC,
        }),
        enabled: open,
    });

    const form = useForm<AnthropicFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "anthropicResponse",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || "claude-3-5-sonnet-latest",
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "anthropicResponse",
                credentialId: defaultValues.credentialId || "",
                model: defaultValues.model || "claude-3-5-sonnet-latest",
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "anthropicResponse";

    const handleSubmit = (values: AnthropicFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Image
                            src="/anthropic.svg"
                            alt="Anthropic"
                            width={20}
                            height={20}
                            className="size-5"
                        />
                        Anthropic
                    </DialogTitle>
                    <DialogDescription>
                        Generate text and reason with Claude models.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 mt-2"
                    >
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="anthropicResponse"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Access the output in subsequent nodes using:{" "}
                                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                            {`{{${watchVariableName}.text}}`}
                                        </code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Anthropic Credential</FormLabel>
                                        <Link
                                            href="/credentials/new"
                                            target="_blank"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            + Add new key
                                        </Link>
                                    </div>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoadingCredentials}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select an Anthropic API Key" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentials && credentials.length > 0 ? (
                                                credentials.map((cred) => (
                                                    <SelectItem
                                                        key={cred.id}
                                                        value={cred.id}
                                                    >
                                                        {cred.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-3 text-xs text-muted-foreground text-center">
                                                    No Anthropic credentials found.{" "}
                                                    <Link
                                                        href="/credentials/new"
                                                        target="_blank"
                                                        className="text-primary underline"
                                                    >
                                                        Create one here
                                                    </Link>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a Claude model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ANTHROPIC_MODELS.map((m) => (
                                                <SelectItem
                                                    key={m.value}
                                                    value={m.value}
                                                >
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="systemPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="You are Claude, a helpful and precise assistant..."
                                            className="min-h-[80px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        System instructions. Template variables like{" "}
                                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                            {"{{variable}}"}
                                        </code>{" "}
                                        are supported.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="userPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Analyze and extract key insights: {{httpResponse.data}}"
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Prompt sent to Claude. Use{" "}
                                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                            {"{{variables}}"}
                                        </code>{" "}
                                        to inject contextual data.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4">
                            <Button type="submit">Save Settings</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
