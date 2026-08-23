import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspenseToolkits = () => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.integrations.getToolkits.queryOptions());
};

export const useSuspenseConnectedAccounts = () => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.integrations.getConnectedAccounts.queryOptions());
};

export const useInitiateConnection = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.integrations.initiateConnection.mutationOptions({
            onError: (error) => {
                toast.error(`Failed to connect: ${error.message}`);
            },
            onSuccess: () => {
                // Invalidation happens in the polling callback after popup closes
                queryClient.invalidateQueries(
                    trpc.integrations.getConnectedAccounts.queryOptions()
                );
            },
        })
    );
};
