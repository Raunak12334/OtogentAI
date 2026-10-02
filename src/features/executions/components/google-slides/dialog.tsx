"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CredentialType } from "@/generated/prisma/enums";
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
import { Switch } from "@/components/ui/switch";

const DEFAULT_REPLACEMENTS = `{
  "{{investorName}}": "{{sheetsData.rows.0.Name}}",
  "{{totalInvestment}}": "{{sheetsData.rows.0.InvAmt}}",
  "{{currentValue}}": "{{sheetsData.rows.0.CurrentValue}}",
  "{{gainLoss}}": "{{sheetsData.rows.0.GainLoss}}",
  "{{reportDate}}": "SEP - 2026",
  "{{aiSummary}}": "{{geminiResponse.text}}"
}`;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Must start with a letter or underscore; only letters, numbers, underscores allowed",
    }),
  credentialId: z.string().min(1, { message: "Credential is required" }),
  presentationId: z.string().min(1, { message: "Presentation ID is required" }),
  replacements: z.string().optional(),
  aiContentField: z.string().optional(),
  templateMode: z.boolean().optional(),
  templateSlideCount: z.number().min(1).max(100).optional(),
  generatedSlideAction: z.enum(["replace", "append"]).optional(),
  newPresentationTitle: z.string().optional(),
  targetFolderId: z.string().optional(),
  holdingsSlideIndex: z.number().min(0).max(100).optional(),
});

export type GoogleSlidesFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GoogleSlidesFormValues) => void;
  defaultValues?: Partial<GoogleSlidesFormValues>;
}

export const GoogleSlidesDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const trpc = useTRPC();
  const { data: credentials, isLoading: isLoadingCredentials } = useQuery({
    ...trpc.credentials.getByType.queryOptions({
      type: CredentialType.GOOGLE,
    }),
    enabled: open,
  });

  const form = useForm<GoogleSlidesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: "slidesResult",
      presentationId: "",
      replacements: DEFAULT_REPLACEMENTS,
      aiContentField: "",
      credentialId: "",
      templateMode: false,
      templateSlideCount: 3,
      generatedSlideAction: "replace",
      newPresentationTitle: "",
      targetFolderId: "",
      holdingsSlideIndex: 3,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: "slidesResult",
        presentationId: "",
        replacements: DEFAULT_REPLACEMENTS,
        aiContentField: "",
        credentialId: "",
        templateMode: false,
        templateSlideCount: 3,
        generatedSlideAction: "replace",
        newPresentationTitle: "",
        targetFolderId: "",
        holdingsSlideIndex: 3,
        ...defaultValues,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: GoogleSlidesFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const hasCredentials = credentials && credentials.length > 0;
  const variableName = form.watch("variableName") || "slidesResult";
  const isTemplateMode = form.watch("templateMode");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src="/googleslides.svg"
              alt="Google Slides"
              className="size-5 object-contain"
            />
            Google Slides
          </DialogTitle>
          <DialogDescription>
            Replace <code>{"{{placeholder}}"}</code> text in your pre-built
            Google Slides presentation with real data from your sheet or AI node.
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
                    <Input placeholder="slidesResult" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Access the result as{" "}
                    <code>{`{{${variableName}.presentationUrl}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential */}
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Credential</FormLabel>
                  {!hasCredentials && !isLoadingCredentials ? (
                    <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                      No Google credentials found.{" "}
                      <Link
                        href="/credentials/new"
                        className="text-primary underline"
                        target="_blank"
                      >
                        Add one here
                      </Link>{" "}
                      — choose type <strong>Google</strong>. The service account
                      email must have <strong>Editor</strong> access on the
                      presentation.
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Google credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentials?.map((cred) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormDescription className="text-xs">
                    Use the same Google Service Account as the Sheets node.
                    Share your presentation with the service account email as{" "}
                    <strong>Editor</strong>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Presentation ID */}
            <FormField
              control={form.control}
              name="presentationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isTemplateMode ? "Template Presentation ID" : "Presentation ID"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1EAYk18WDjIG-zp_0vLm3CsfQh_i8eXc67Jo2O9C6Eld"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {isTemplateMode ? (
                      <>
                        The <strong>reference slide</strong> with{" "}
                        <code>{"{{placeholders}}"}</code>. A fresh copy will be
                        created each run — the original is <strong>never modified</strong>.
                      </>
                    ) : (
                      <>
                        From the Slides URL:{" "}
                        <code>
                          docs.google.com/presentation/d/<strong>[ID]</strong>/edit
                        </code>
                      </>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template Mode Toggle */}
            <FormField
              control={form.control}
              name="templateMode"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                  <div className="space-y-0.5 pr-2">
                    <FormLabel className="text-sm font-medium">Duplicate Template to New Slide(s)</FormLabel>
                    <FormDescription className="text-xs">
                      Keeps your template slide(s) untouched with all{" "}
                      <code>{"{{placeholders}}"}</code> intact. Creates new slide(s) and updates the new slide(s) each run.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Template Mode Configuration */}
            {isTemplateMode && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3">
                <FormField
                  control={form.control}
                  name="templateSlideCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Template Slides Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          placeholder="3"
                          {...field}
                          value={field.value ?? 3}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        First N slides to preserve as template (e.g. 3).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generatedSlideAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Subsequent Runs</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? "replace"}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Action on new run" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="replace">
                            Replace previous report
                          </SelectItem>
                          <SelectItem value="append">
                            Append new slides
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[11px]">
                        Replace keeps presentation clean.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Replacement Map */}
            <FormField
              control={form.control}
              name="replacements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder Replacements (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={9}
                      className="font-mono text-xs"
                      placeholder={DEFAULT_REPLACEMENTS}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs space-y-1">
                    <span className="block font-medium text-foreground">
                      Map each <code>{"{{placeholder}}"}</code> in your slides to a value.
                    </span>
                    <span className="block">
                      • <code>{"{{sheetsData.rows.0.Name}}"}</code> — value from first data row
                    </span>
                    <span className="block">
                      • <code>{"{{geminiResponse.text}}"}</code> — full AI output text
                    </span>
                    <span className="block text-amber-600 dark:text-amber-400">
                      ⚠ Placeholders must exist in your slides exactly as <code>{"{{name}}"}</code>
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI Content Field */}
            <FormField
              control={form.control}
              name="aiContentField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI JSON Output Field (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="{{geminiResponse.text}}"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    If your AI node returns a JSON object with replacement
                    keys, enter its field here. The executor will auto-merge it
                    with the map above.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Holdings Table Slide */}
            <FormField
              control={form.control}
              name="holdingsSlideIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holdings Table — Slide Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="3"
                      {...field}
                      value={field.value ?? 3}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    The slide that contains the mutual-fund holdings table
                    (1-based, default <strong>3</strong>). Set to{" "}
                    <code>0</code> to search all slides.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
