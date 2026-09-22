"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
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
import { CredentialType } from "@/generated/prisma/enums";
import { useTRPC } from "@/trpc/client";
import type { TelegramActionNodeData } from "./executor";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  authType: z.enum(["inherit", "credential", "custom"]),
  credentialId: z.string().optional(),
  botToken: z.string().optional(),
  chatId: z.string().min(1, { message: "Chat ID is required" }),
  text: z.string().min(1, { message: "Message text is required" }),
  parseMode: z.enum(["HTML", "MarkdownV2", "Markdown", "None"]),
});

export type TelegramActionFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TelegramActionFormValues) => void;
  defaultValues?: Partial<TelegramActionNodeData>;
}

export const TelegramActionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const trpc = useTRPC();
  const { data: credentials } = useQuery({
    ...trpc.credentials.getByType.queryOptions({
      type: CredentialType.TELEGRAM,
    }),
    enabled: open,
  });

  const form = useForm<TelegramActionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "telegramResponse",
      authType: defaultValues.authType || "inherit",
      credentialId: defaultValues.credentialId || "",
      botToken: defaultValues.botToken || "",
      chatId: defaultValues.chatId || "{{telegram.chatId}}",
      text: defaultValues.text || "",
      parseMode: defaultValues.parseMode || "HTML",
    },
  });

  const authType = form.watch("authType");
  const watchVariableName = form.watch("variableName") || "telegramResponse";

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "telegramResponse",
        authType: defaultValues.authType || "inherit",
        credentialId: defaultValues.credentialId || "",
        botToken: defaultValues.botToken || "",
        chatId: defaultValues.chatId || "{{telegram.chatId}}",
        text: defaultValues.text || "",
        parseMode: defaultValues.parseMode || "HTML",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: TelegramActionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              src="/telegram.svg"
              alt="Telegram"
              width={20}
              height={20}
              className="size-5"
            />
            Send Telegram Message
          </DialogTitle>
          <DialogDescription>
            Send a message to a Telegram chat or reply to an incoming trigger.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="telegramResponse" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name used to access the result in downstream nodes:{" "}
                    <code>{`{{${watchVariableName}.messageId}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Authentication Source */}
            <FormField
              control={form.control}
              name="authType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Token Authentication</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select authentication method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inherit">
                        Use Bot Token from Telegram Trigger (Workflow)
                      </SelectItem>
                      <SelectItem value="credential">
                        Use Saved Credential
                      </SelectItem>
                      <SelectItem value="custom">
                        Enter Custom Bot Token
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Inherit the token from the trigger node or provide a custom
                    one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential Selector */}
            {authType === "credential" && (
              <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram Credential</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Telegram credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentials && credentials.length > 0 ? (
                          credentials.map((cred) => (
                            <SelectItem key={cred.id} value={cred.id}>
                              {cred.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-muted-foreground">
                            No Telegram credentials found.{" "}
                            <Link
                              href="/credentials"
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
            )}

            {/* Custom Bot Token */}
            {authType === "custom" && (
              <FormField
                control={form.control}
                name="botToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Token provided by @BotFather.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Chat ID */}
            <FormField
              control={form.control}
              name="chatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="{{telegram.chatId}}"
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Target Telegram chat ID. Use{" "}
                    <code>{"{{telegram.chatId}}"}</code> to reply to incoming
                    messages.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parse Mode */}
            <FormField
              control={form.control}
              name="parseMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parse Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select formatting mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HTML">HTML</SelectItem>
                      <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                      <SelectItem value="Markdown">
                        Markdown (Legacy)
                      </SelectItem>
                      <SelectItem value="None">Plain Text (None)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Format formatting tags (e.g.{" "}
                    <code>&lt;b&gt;bold&lt;/b&gt;</code> in HTML).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Text */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello {{telegram.sender.firstName}}! Your response is:&#10;{{openAIResponse.text}}"
                      rows={5}
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Supports Handlebars template variables from previous nodes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Helper info */}
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Common Variables:</p>
              <p>
                <code>{"{{telegram.chatId}}"}</code> - Incoming chat ID
              </p>
              <p>
                <code>{"{{telegram.text}}"}</code> - User&apos;s incoming
                message
              </p>
              <p>
                <code>{"{{telegram.sender.username}}"}</code> - Sender&apos;s
                username
              </p>
              <p>
                <code>{"{{openAIResponse.text}}"}</code> or{" "}
                <code>{"{{geminiResponse.text}}"}</code> - AI generated reply
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
