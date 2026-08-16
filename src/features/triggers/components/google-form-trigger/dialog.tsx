" use client ";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
    const params = useParams();
    const workflowId = params.workflowId as string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error("Failed to copy URL");
        };
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google Form Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this Webhook URL in your Google Form's Apps Script to trigger this workflow.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                type="button"
                                size="icon"
                                onClick={copyToClipboard}

                            >
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="text-sm font-medium">Setup Instruction</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Open your Google Form</li>
                            <li>Click the three dots menu → Script editor</li>
                            <li>Copy and paste the script below</li>
                            <li>Replace WEBHOOK_URL with your webhook URL above</li>
                            <li>Save and click "Triggers" → Add Trigger</li>
                            <li>Choose: From form → On form submit → Save</li>
                        </ol>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-3">
                        <h4 className="text-sm font-medium">Google Apps Script:</h4>
                        <Button
                            type="button" onClick={async () => {
                                const script = generateGoogleFormScript(webhookUrl);
                                try {
                                    await navigator.clipboard.writeText(script);
                                    toast.success("Script copied to clipboard")
                                } catch {
                                    toast.error("Failed to copy script to clipboard     ")
                                }
                            }} variant="outline" >
                            <CopyIcon className="size-4 mr-2" />
                            Copy Google Apps Script
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            This script includes your webhook URL and handles form submissions
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};