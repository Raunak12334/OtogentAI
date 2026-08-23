"use client";

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    useSuspenseConnectedAccounts,
    useSuspenseToolkits,
    useInitiateConnection,
} from "../hooks/use-integrations";
import { CheckCircle2Icon, ExternalLinkIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120_000; // 2 minutes

export const IntegrationsLoading = () => (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin mr-2" />
        Loading integrations...
    </div>
);

export const IntegrationsError = () => (
    <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load integrations. Please refresh.
    </div>
);

export const IntegrationsList = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [connectingSlug, setConnectingSlug] = useState<string | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: toolkits } = useSuspenseToolkits();
    const { data: connectedAccounts } = useSuspenseConnectedAccounts();
    const initiate = useInitiateConnection();

    // Build a Set of connected toolkit slugs for O(1) lookup (only ACTIVE accounts)
    const connectedSlugs = new Set(
        connectedAccounts.items
            ?.filter(
                (acct: { status?: string }) =>
                    !acct.status || acct.status === "ACTIVE"
            )
            ?.map((acct: { toolkitSlug?: string; toolkit?: { slug?: string } }) =>
                (acct.toolkit?.slug ?? acct.toolkitSlug)?.toLowerCase()
            )
            .filter((s): s is string => Boolean(s)) ?? []
    );

    const stopPolling = useCallback(() => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        pollTimerRef.current = null;
        pollTimeoutRef.current = null;
    }, []);

    const startPolling = useCallback(
        (toolkitSlug: string, previousCount: number, popupWindow?: Window | null) => {
            stopPolling();

            pollTimerRef.current = setInterval(async () => {
                try {
                    const fresh = await queryClient.fetchQuery(
                        trpc.integrations.getConnectedAccounts.queryOptions()
                    );

                    const target = toolkitSlug.toLowerCase();
                    const newCount =
                        fresh?.items?.filter((a) => {
                            const slug = (a.toolkit?.slug ?? (a as { toolkitSlug?: string }).toolkitSlug)?.toLowerCase();
                            return slug === target && (!a.status || a.status === "ACTIVE");
                        }).length ?? 0;

                    if (newCount > previousCount) {
                        stopPolling();
                        setConnectingSlug(null);
                        try {
                            popupWindow?.close();
                        } catch {
                            // ignore cross-origin error
                        }
                        toast.success(`Successfully connected ${toolkitSlug}`);
                        return;
                    }

                    // If user closed the popup window, stop polling immediately
                    if (popupWindow && popupWindow.closed) {
                        stopPolling();
                        setConnectingSlug(null);
                    }
                } catch {
                    // ignore polling errors
                }
            }, 1500);

            pollTimeoutRef.current = setTimeout(() => {
                stopPolling();
                setConnectingSlug(null);
            }, POLL_TIMEOUT_MS);
        },
        [queryClient, stopPolling, trpc.integrations.getConnectedAccounts]
    );

    const handleConnect = useCallback(
        (toolkitSlug: string) => {
            setConnectingSlug(toolkitSlug);
            const target = toolkitSlug.toLowerCase();
            const previousCount =
                connectedAccounts.items?.filter((a: { toolkitSlug?: string; toolkit?: { slug?: string }; status?: string }) => {
                    const slug = (a.toolkit?.slug ?? a.toolkitSlug)?.toLowerCase();
                    return slug === target && (!a.status || a.status === "ACTIVE");
                }).length ?? 0;

            // Open window synchronously in the user gesture callstack to prevent browser popup blockers
            const popup = window.open(
                "about:blank",
                "composio-connect",
                "width=520,height=700,left=400,top=100"
            );

            initiate.mutate(
                { toolkitSlug },
                {
                    onSuccess: ({ redirectUrl }) => {
                        if (!redirectUrl) {
                            popup?.close();
                            toast.error("No redirect URL returned. Check your Auth Config in the Composio dashboard.");
                            setConnectingSlug(null);
                            return;
                        }

                        if (popup && !popup.closed) {
                            popup.location.href = redirectUrl;
                        } else {
                            // Fallback to top window redirect if popup was manually closed or strictly blocked
                            window.open(redirectUrl, "_blank");
                        }

                        startPolling(toolkitSlug, previousCount, popup);
                    },
                    onError: () => {
                        popup?.close();
                        setConnectingSlug(null);
                    },
                }
            );
        },
        [initiate, connectedAccounts.items, startPolling]
    );

    // Client-side search filter
    const filtered = (toolkits as Array<{ name: string; slug: string; meta?: { logo?: string; description?: string }; noAuth?: boolean }>) 
        .filter((tk) =>
            tk.name.toLowerCase().includes(search.toLowerCase()) ||
            tk.slug.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-semibold">Integrations</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Connect your accounts to use them in workflow nodes.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search integrations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Card grid */}
            {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">No integrations match your search.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((toolkit) => {
                        const isConnected = connectedSlugs.has(toolkit.slug.toLowerCase());
                        const isConnecting = connectingSlug === toolkit.slug;

                        return (
                            <div
                                key={toolkit.slug}
                                className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm"
                            >
                                {/* Logo + name row */}
                                <div className="flex items-center gap-3">
                                    {toolkit.meta?.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={toolkit.meta.logo}
                                            alt={toolkit.name}
                                            className="size-8 rounded object-contain"
                                        />
                                    ) : (
                                        <div className="size-8 rounded bg-muted flex items-center justify-center text-xs font-bold uppercase">
                                            {toolkit.name.slice(0, 2)}
                                        </div>
                                    )}
                                    <span className="font-medium text-sm leading-tight line-clamp-1">
                                        {toolkit.name}
                                    </span>
                                </div>

                                {/* Description */}
                                {toolkit.meta?.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                        {toolkit.meta.description}
                                    </p>
                                )}

                                {/* Footer: badge + button */}
                                <div className="flex items-center justify-between mt-auto pt-1 gap-2">
                                    {isConnected ? (
                                        <Badge
                                            variant="outline"
                                            className="text-emerald-600 border-emerald-300 gap-1"
                                        >
                                            <CheckCircle2Icon className="size-3" />
                                            Connected
                                        </Badge>
                                    ) : (
                                        <span />
                                    )}

                                    <Button
                                        size="sm"
                                        variant={isConnected ? "outline" : "default"}
                                        disabled={isConnected || isConnecting}
                                        onClick={() => handleConnect(toolkit.slug)}
                                        className="gap-1 shrink-0"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <Loader2Icon className="size-3 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : isConnected ? (
                                            "Connected"
                                        ) : (
                                            <>
                                                Connect
                                                <ExternalLinkIcon className="size-3" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
