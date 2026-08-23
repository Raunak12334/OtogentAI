import { prefetch, trpc } from "@/trpc/server";

export const prefetchToolkits = () => {
    return prefetch(trpc.integrations.getToolkits.queryOptions());
};

export const prefetchConnectedAccounts = () => {
    return prefetch(trpc.integrations.getConnectedAccounts.queryOptions());
};
