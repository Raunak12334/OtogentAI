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
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Must start with a letter or underscore; only letters, numbers, underscores allowed",
    }),
  credentialId: z.string().min(1, { message: "Credential is required" }),
  spreadsheetId: z.string().min(1, { message: "Spreadsheet ID is required" }),
  sheetName: z.string().optional(),
  range: z.string().optional(),
  includeHeaders: z.boolean().optional(),
});

export type GoogleSheetsFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GoogleSheetsFormValues) => void;
  defaultValues?: Partial<GoogleSheetsFormValues>;
}

export const GoogleSheetsDialog = ({
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

  const form = useForm<GoogleSheetsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: "sheetsData",
      spreadsheetId: "",
      sheetName: "Sheet1",
      range: "A1:Z1000",
      includeHeaders: true,
      credentialId: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: "sheetsData",
        spreadsheetId: "",
        sheetName: "Sheet1",
        range: "A1:Z1000",
        includeHeaders: true,
        credentialId: "",
        ...defaultValues,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: GoogleSheetsFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const hasCredentials = credentials && credentials.length > 0;
  const variableName = form.watch("variableName") || "sheetsData";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src="/googlesheets.svg"
              alt="Google Sheets"
              className="size-5 object-contain"
            />
            Google Sheets
          </DialogTitle>
          <DialogDescription>
            Read data from a Google Spreadsheet and pass it to later nodes.
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
                    <Input placeholder="sheetsData" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Reference this in later nodes as{" "}
                    <code>{`{{${variableName}.text}}`}</code> (for AI) or{" "}
                    <code>{`{{${variableName}.rows.0.ColumnName}}`}</code> (for specific cells).
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
                      — choose type <strong>Google</strong> and paste your Service Account JSON as the value.
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
                    Create a{" "}
                    <a
                      href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      Google Service Account
                    </a>
                    , download the JSON key, paste it as the credential value,
                    then share your spreadsheet with the service account email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Spreadsheet ID */}
            <FormField
              control={form.control}
              name="spreadsheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spreadsheet ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    From the sheet URL:{" "}
                    <code>
                      docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit
                    </code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sheet Name */}
            <FormField
              control={form.control}
              name="sheetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sheet (Tab) Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sheet1" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    The tab name shown at the bottom of the spreadsheet (e.g.
                    Sheet0, Data, Holdings).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Range */}
            <FormField
              control={form.control}
              name="range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Range</FormLabel>
                  <FormControl>
                    <Input placeholder="A1:Z1000" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    A1 notation (e.g. <code>A1:H50</code>). Leave as{" "}
                    <code>A1:Z1000</code> to read all data.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Include Headers */}
            <FormField
              control={form.control}
              name="includeHeaders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-md border p-3">
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="cursor-pointer">First row is headers</FormLabel>
                    <FormDescription className="text-xs">
                      When on, row 1 becomes column names for named access like{" "}
                      <code>{`{{${variableName}.rows.0.Name}}`}</code>.
                    </FormDescription>
                  </div>
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
