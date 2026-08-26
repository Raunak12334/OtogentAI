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

export const GEMINI_MODELS = [
    { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (Latest, Fast & Advanced)" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Fast)" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Deep Reasoning)" },
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

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: GeminiFormValues) => void;
    defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const trpc = useTRPC();
    const { data: credentials, isLoading: isLoadingCredentials } = useQuery({
        ...trpc.credentials.getByType.queryOptions({
            type: CredentialType.GEMINI,
        }),
        enabled: open,
    });

    const form = useForm<GeminiFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "geminiResponse",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || "gemini-3.6-flash",
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "geminiResponse",
                credentialId: defaultValues.credentialId || "",
                model: defaultValues.model || "gemini-3.6-flash",
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "geminiResponse";

    const handleSubmit = (values: GeminiFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Image
                            src="/gemini.svg"
                            alt="Gemini"
                            width={20}
                            height={20}
                            className="size-5"
                        />
                        Google Gemini
                    </DialogTitle>
                    <DialogDescription>
                        Generate content and reasoning using Google Gemini models.
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
                                            placeholder="geminiResponse"
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
                                        <FormLabel>Gemini Credential</FormLabel>
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
                                                <SelectValue placeholder="Select a Gemini API Key" />
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
                                                    No Gemini credentials found.{" "}
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
                                                <SelectValue placeholder="Select a Gemini model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GEMINI_MODELS.map((m) => (
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
                                            placeholder="You are an expert AI developer..."
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
                                            placeholder="Generate a response based on: {{httpResponse.data}}"
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Prompt sent to Gemini. Use{" "}
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
