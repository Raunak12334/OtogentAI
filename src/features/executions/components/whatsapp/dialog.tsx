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
import type { WhatsAppActionNodeData } from "./executor";

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
  accessToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
  recipientPhone: z.string().min(1, { message: "Recipient phone number is required" }),
  text: z.string().min(1, { message: "Message text is required" }),
});

export type WhatsAppActionFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WhatsAppActionFormValues) => void;
  defaultValues?: Partial<WhatsAppActionNodeData>;
}

export const WhatsAppActionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const trpc = useTRPC();
  const { data: credentials } = useQuery({
    ...trpc.credentials.getByType.queryOptions({
      type: CredentialType.WHATSAPP,
    }),
    enabled: open,
  });

  const form = useForm<WhatsAppActionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "whatsappResponse",
      authType: defaultValues.authType || "inherit",
      credentialId: defaultValues.credentialId || "",
      accessToken: defaultValues.accessToken || "",
      phoneNumberId: defaultValues.phoneNumberId || "",
      recipientPhone: defaultValues.recipientPhone || "{{whatsapp.from}}",
      text: defaultValues.text || "",
    },
  });

  const authType = form.watch("authType");
  const watchVariableName = form.watch("variableName") || "whatsappResponse";

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "whatsappResponse",
        authType: defaultValues.authType || "inherit",
        credentialId: defaultValues.credentialId || "",
        accessToken: defaultValues.accessToken || "",
        phoneNumberId: defaultValues.phoneNumberId || "",
        recipientPhone: defaultValues.recipientPhone || "{{whatsapp.from}}",
        text: defaultValues.text || "",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: WhatsAppActionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              src="/whatsapp.svg"
              alt="WhatsApp"
              width={20}
              height={20}
              className="size-5"
            />
            Send WhatsApp Message
          </DialogTitle>
          <DialogDescription>
            Send a text message to a WhatsApp number or reply to an incoming
            trigger.
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
                    <Input placeholder="whatsappResponse" {...field} />
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
                  <FormLabel>Access Token Authentication</FormLabel>
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
                        Use Token from WhatsApp Trigger (Workflow)
                      </SelectItem>
                      <SelectItem value="credential">
                        Use Saved Credential
                      </SelectItem>
                      <SelectItem value="custom">
                        Enter Custom Access Token
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
                    <FormLabel>WhatsApp Credential</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a WhatsApp credential" />
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
                            No WhatsApp credentials found.{" "}
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

            {/* Custom Access Token */}
            {authType === "custom" && (
              <FormField
                control={form.control}
                name="accessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="EAAxxxxxxx..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Permanent access token from Meta Developer Portal.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Phone Number ID */}
            <FormField
              control={form.control}
              name="phoneNumberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number ID (optional if inherited)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890"
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The WhatsApp Business phone number ID to send from. Leave
                    empty to inherit from the trigger node.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipient Phone */}
            <FormField
              control={form.control}
              name="recipientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="{{whatsapp.from}}"
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Target phone number in E.164 format (e.g. 14155238886). Use{" "}
                    <code>{"{{whatsapp.from}}"}</code> to reply to the sender.
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
                      placeholder={"Hello {{whatsapp.name}}! Your response is:\n{{openAIResponse.text}}"}
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
                <code>{"{{whatsapp.from}}"}</code> - Sender&apos;s phone number
              </p>
              <p>
                <code>{"{{whatsapp.text}}"}</code> - Sender&apos;s message text
              </p>
              <p>
                <code>{"{{whatsapp.name}}"}</code> - Sender&apos;s profile name
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
