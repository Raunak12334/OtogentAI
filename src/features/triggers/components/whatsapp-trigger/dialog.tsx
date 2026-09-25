"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  Loader2Icon,
  UnplugIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectWhatsAppWebhook, disconnectWhatsAppWebhook } from "./actions";

export type WhatsAppTriggerNodeData = {
  accessToken?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  webhookConnected?: boolean;
  webhookUrl?: string;
  verifyToken?: string;
  customBaseUrl?: string;
  [key: string]: unknown;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  data?: WhatsAppTriggerNodeData;
  onUpdateNodeData: (data: Partial<WhatsAppTriggerNodeData>) => void;
}

export const WhatsAppTriggerDialog = ({
  open,
  onOpenChange,
  nodeId,
  data = {},
  onUpdateNodeData,
}: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const [accessToken, setAccessToken] = useState(data.accessToken || "");
  const [phoneNumberId, setPhoneNumberId] = useState(
    data.phoneNumberId || "",
  );
  const [customBaseUrl, setCustomBaseUrl] = useState(
    data.customBaseUrl || "",
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Synchronize local form state with node data when dialog opens
  useEffect(() => {
    if (open) {
      setAccessToken(data.accessToken || "");
      setPhoneNumberId(data.phoneNumberId || "");
      setCustomBaseUrl(data.customBaseUrl || "");
    }
  }, [open, data]);

  // Determine current app base URL
  const appUrl =
    customBaseUrl.trim() ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  const isHttps = appUrl.startsWith("https://");

  const webhookUrl = useMemo(() => {
    const cleanBase = appUrl.replace(/\/+$/, "");
    return `${cleanBase}/api/webhooks/whatsapp?workflowId=${workflowId}`;
  }, [appUrl, workflowId]);

  const isConnected = Boolean(data.webhookConnected);

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleCopyVerifyToken = async () => {
    try {
      if (data.verifyToken) {
        await navigator.clipboard.writeText(data.verifyToken);
        toast.success("Verify token copied to clipboard");
      }
    } catch {
      toast.error("Failed to copy verify token");
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast.error("Please enter your WhatsApp Access Token");
      return;
    }

    if (!phoneNumberId.trim()) {
      toast.error("Please enter your Phone Number ID");
      return;
    }

    if (!isHttps) {
      toast.error(
        "WhatsApp requires an HTTPS URL. Enter an ngrok or public tunnel URL.",
      );
      return;
    }

    setIsConnecting(true);
    try {
      const res = await connectWhatsAppWebhook({
        workflowId,
        nodeId,
        accessToken: accessToken.trim(),
        phoneNumberId: phoneNumberId.trim(),
        webhookBaseUrl: appUrl,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to connect WhatsApp webhook");
        return;
      }

      toast.success(
        res.verifiedName
          ? `Connected successfully to ${res.verifiedName}!`
          : "WhatsApp webhook configured successfully!",
      );

      onUpdateNodeData({
        accessToken: accessToken.trim(),
        phoneNumberId: phoneNumberId.trim(),
        displayPhoneNumber: res.displayPhoneNumber,
        verifiedName: res.verifiedName,
        webhookConnected: true,
        webhookUrl: res.webhookUrl,
        verifyToken: res.verifyToken,
        customBaseUrl: customBaseUrl.trim(),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect webhook",
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await disconnectWhatsAppWebhook({
        nodeId,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to disconnect webhook");
        return;
      }

      toast.success("WhatsApp webhook disconnected");
      onUpdateNodeData({
        webhookConnected: false,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect webhook",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSaveSettings = () => {
    onUpdateNodeData({
      customBaseUrl: customBaseUrl.trim(),
    });
    toast.success("Settings saved");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              src="/whatsapp.svg"
              alt="WhatsApp"
              width={22}
              height={22}
              className="size-5"
            />
            WhatsApp Trigger Configuration
          </DialogTitle>
          <DialogDescription>
            Triggers this workflow whenever a message is received on your
            WhatsApp Business number via the Cloud API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Status Badge */}
          <div className="flex items-center justify-between rounded-lg border p-3.5 bg-muted/30">
            <div className="flex items-center gap-2.5">
              {isConnected ? (
                <CheckCircle2Icon className="size-5 text-emerald-500" />
              ) : (
                <div className="size-2.5 rounded-full bg-muted-foreground/40 ml-1.5 mr-1" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isConnected
                    ? `Connected: ${data.verifiedName || data.displayPhoneNumber || "WhatsApp Business"}`
                    : "Webhook Not Connected"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isConnected
                    ? "Listening for incoming WhatsApp messages"
                    : "Provide your Access Token and Phone Number ID, then click Connect"}
                </p>
              </div>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200"
                >
                  Active
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDisconnecting}
                  onClick={handleDisconnect}
                  className="text-destructive hover:bg-destructive/10"
                >
                  {isDisconnecting ? (
                    <Loader2Icon className="size-3.5 animate-spin mr-1" />
                  ) : (
                    <UnplugIcon className="size-3.5 mr-1" />
                  )}
                  Disconnect
                </Button>
              </div>
            ) : (
              <Badge variant="secondary">Idle</Badge>
            )}
          </div>

          {/* Access Token Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="access-token" className="text-sm font-semibold">
                WhatsApp Access Token
              </Label>
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get token from Meta Developer Portal
                <ExternalLinkIcon className="size-3" />
              </a>
            </div>
            <Input
              id="access-token"
              type="password"
              placeholder="EAAxxxxxxx..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Permanent access token or system user token from Meta Developer
              Portal. Keep this token secret.
            </p>
          </div>

          {/* Phone Number ID */}
          <div className="space-y-2">
            <Label htmlFor="phone-number-id" className="text-sm font-semibold">
              Phone Number ID
            </Label>
            <Input
              id="phone-number-id"
              placeholder="1234567890"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Found in your Meta Developer App → WhatsApp → API Setup →
              Phone Number ID.
            </p>
          </div>

          {/* Non-HTTPS / Localhost Tunnel Warning */}
          {!isHttps && (
            <Alert
              variant="destructive"
              className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-300"
            >
              <AlertTriangleIcon className="size-4 text-amber-600" />
              <AlertTitle className="text-sm font-medium">
                HTTPS Webhook Required
              </AlertTitle>
              <AlertDescription className="text-xs space-y-2 mt-1">
                <p>
                  WhatsApp rejects non-HTTPS and localhost URLs. To test
                  locally, run a tunnel (e.g.{" "}
                  <code className="font-mono bg-black/10 px-1 py-0.5 rounded">
                    ngrok http 3000
                  </code>
                  ) and paste the HTTPS tunnel URL below.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Public URL Override */}
          <div className="space-y-2">
            <Label htmlFor="tunnel-url" className="text-sm">
              Public Base URL (Optional tunnel override)
            </Label>
            <Input
              id="tunnel-url"
              placeholder="https://your-tunnel.ngrok-free.app"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Defaults to NEXT_PUBLIC_APP_URL. Override here when using ngrok or
              Cloudflare Tunnel.
            </p>
          </div>

          {/* Webhook URL preview */}
          <div className="space-y-2">
            <Label htmlFor="webhook-preview" className="text-sm">
              Calculated Webhook URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-preview"
                value={webhookUrl}
                readOnly
                className="font-mono text-xs bg-muted/50"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyWebhook}
                title="Copy Webhook URL"
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          {/* Verify Token (shown after connecting) */}
          {isConnected && data.verifyToken && (
            <div className="space-y-2">
              <Label htmlFor="verify-token" className="text-sm">
                Verify Token (paste into Meta Dashboard)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="verify-token"
                  value={data.verifyToken}
                  readOnly
                  className="font-mono text-xs bg-muted/50"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopyVerifyToken}
                  title="Copy Verify Token"
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste this token in your Meta Developer App → WhatsApp →
                Configuration → Callback URL → Verify Token field.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              className="flex-1"
              disabled={
                isConnecting ||
                !accessToken.trim() ||
                !phoneNumberId.trim()
              }
              onClick={handleConnect}
            >
              {isConnecting ? (
                <Loader2Icon className="size-4 animate-spin mr-2" />
              ) : (
                <ZapIcon className="size-4 mr-2" />
              )}
              {isConnected ? "Update Connection" : "Connect Webhook"}
            </Button>
            {isConnected && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            )}
          </div>

          {/* Setup Instructions */}
          <div className="rounded-lg bg-muted/60 p-4 space-y-2 border">
            <h4 className="font-medium text-sm">Quick Setup Guide:</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://developers.facebook.com/apps/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Meta Developer Portal
                </a>{" "}
                and create or select an App with WhatsApp product.
              </li>
              <li>
                Under <strong>WhatsApp → API Setup</strong>, copy the{" "}
                <strong>Phone Number ID</strong> and generate a{" "}
                <strong>Permanent Access Token</strong>.
              </li>
              <li>
                Paste them into the fields above and click{" "}
                <strong>Connect Webhook</strong>.
              </li>
              <li>
                Copy the <strong>Webhook URL</strong> and{" "}
                <strong>Verify Token</strong> shown above.
              </li>
              <li>
                In Meta Developer Portal → <strong>WhatsApp → Configuration</strong>,
                paste the Webhook URL and Verify Token, then click{" "}
                <strong>Verify and Save</strong>.
              </li>
              <li>
                Subscribe to the <strong>messages</strong> webhook field.
              </li>
              <li>
                Send a WhatsApp message to your business number to trigger this
                workflow!
              </li>
            </ol>
          </div>

          {/* Available Template Variables */}
          <div className="rounded-lg bg-muted/60 p-4 space-y-2 border">
            <h4 className="font-medium text-sm">
              Available Downstream Variables:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono">
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{whatsapp.text}}"}
                </code>{" "}
                - Incoming message text
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{whatsapp.from}}"}
                </code>{" "}
                - Sender&apos;s phone number
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{whatsapp.name}}"}
                </code>{" "}
                - Sender&apos;s profile name
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{whatsapp.messageId}}"}
                </code>{" "}
                - WhatsApp message ID
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{whatsapp.timestamp}}"}
                </code>{" "}
                - Message timestamp
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{whatsapp.phoneNumberId}}"}
                </code>{" "}
                - Your WhatsApp Business phone number ID
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{json whatsapp}}"}
                </code>{" "}
                - Complete payload as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
