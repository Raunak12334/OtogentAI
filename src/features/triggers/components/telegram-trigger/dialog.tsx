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
import { connectTelegramWebhook, disconnectTelegramWebhook } from "./actions";

export type TelegramTriggerNodeData = {
  botToken?: string;
  botUsername?: string;
  botName?: string;
  webhookConnected?: boolean;
  webhookUrl?: string;
  secretToken?: string;
  commandFilter?: string;
  customBaseUrl?: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  data?: TelegramTriggerNodeData;
  onUpdateNodeData: (data: Partial<TelegramTriggerNodeData>) => void;
}

export const TelegramTriggerDialog = ({
  open,
  onOpenChange,
  nodeId,
  data = {},
  onUpdateNodeData,
}: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const [botToken, setBotToken] = useState(data.botToken || "");
  const [commandFilter, setCommandFilter] = useState(data.commandFilter || "");
  const [customBaseUrl, setCustomBaseUrl] = useState(data.customBaseUrl || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Synchronize local form state with node data when dialog opens
  useEffect(() => {
    if (open) {
      setBotToken(data.botToken || "");
      setCommandFilter(data.commandFilter || "");
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
    return `${cleanBase}/api/webhooks/telegram?workflowId=${workflowId}`;
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

  const handleConnect = async () => {
    if (!botToken.trim()) {
      toast.error("Please enter your Telegram Bot Token");
      return;
    }

    if (!isHttps) {
      toast.error(
        "Telegram requires an HTTPS URL. Enter an ngrok or public tunnel URL.",
      );
      return;
    }

    setIsConnecting(true);
    try {
      const res = await connectTelegramWebhook({
        workflowId,
        nodeId,
        botToken: botToken.trim(),
        webhookBaseUrl: appUrl,
        commandFilter: commandFilter.trim(),
      });

      if (!res.success) {
        toast.error(res.error || "Failed to connect Telegram webhook");
        return;
      }

      toast.success(
        res.botUsername
          ? `Connected successfully to @${res.botUsername}!`
          : "Telegram webhook connected successfully!",
      );

      onUpdateNodeData({
        botToken: botToken.trim(),
        botUsername: res.botUsername,
        botName: res.botName,
        webhookConnected: true,
        webhookUrl: res.webhookUrl,
        commandFilter: commandFilter.trim(),
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
      const res = await disconnectTelegramWebhook({
        nodeId,
        botToken: data.botToken || botToken,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to disconnect webhook");
        return;
      }

      toast.success("Telegram webhook disconnected");
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

  const handleSaveFilter = () => {
    onUpdateNodeData({
      commandFilter: commandFilter.trim(),
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
              src="/telegram.svg"
              alt="Telegram"
              width={22}
              height={22}
              className="size-5"
            />
            Telegram Trigger Configuration
          </DialogTitle>
          <DialogDescription>
            Triggers this workflow whenever a message, command, or channel post
            is received by your Telegram bot.
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
                    ? `Connected: @${data.botUsername || "Telegram Bot"}`
                    : "Webhook Not Connected"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isConnected
                    ? "Bot is listening for incoming messages & commands"
                    : "Provide your Bot Token and click Connect"}
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

          {/* Bot Token Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bot-token" className="text-sm font-semibold">
                Telegram Bot Token
              </Label>
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get token from @BotFather
                <ExternalLinkIcon className="size-3" />
              </a>
            </div>
            <Input
              id="bot-token"
              type="password"
              placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Created via @BotFather in Telegram. Keep this token secret.
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
                  Telegram rejects non-HTTPS and localhost URLs. To test
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

          {/* Optional Command Filter */}
          <div className="space-y-2">
            <Label htmlFor="command-filter" className="text-sm">
              Command Filter (Optional)
            </Label>
            <Input
              id="command-filter"
              placeholder="e.g. /start or /help"
              value={commandFilter}
              onChange={(e) => setCommandFilter(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              If set, the workflow will only run when the incoming message
              starts with this command. Leave empty to trigger on all messages.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              className="flex-1"
              disabled={isConnecting || !botToken.trim()}
              onClick={handleConnect}
            >
              {isConnecting ? (
                <Loader2Icon className="size-4 animate-spin mr-2" />
              ) : (
                <ZapIcon className="size-4 mr-2" />
              )}
              {isConnected ? "Update Webhook Connection" : "Connect Webhook"}
            </Button>
            {isConnected && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveFilter}
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
                Open Telegram and start a chat with <strong>@BotFather</strong>.
              </li>
              <li>
                Send <code>/newbot</code> and follow instructions to name your
                bot.
              </li>
              <li>
                Copy the HTTP API Token provided by BotFather into the input
                above.
              </li>
              <li>
                Click <strong>Connect Webhook</strong>. Nodebase registers the
                webhook with Telegram automatically.
              </li>
              <li>
                Send a message to your bot on Telegram to trigger this workflow!
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
                  {"{{telegram.text}}"}
                </code>{" "}
                - Incoming message text
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{telegram.chatId}}"}
                </code>{" "}
                - Chat ID (send this to reply node)
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{telegram.sender.username}}"}
                </code>{" "}
                - Sender username
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{telegram.sender.firstName}}"}
                </code>{" "}
                - Sender first name
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{telegram.command}}"}
                </code>{" "}
                - Command (e.g. /start)
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{telegram.commandArgs}}"}
                </code>{" "}
                - Command arguments
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-semibold">
                  {"{{json telegram}}"}
                </code>{" "}
                - Complete update payload as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
