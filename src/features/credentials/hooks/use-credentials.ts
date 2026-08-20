import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/generated/prisma/enums";

export const useSuspenseCredentials = () => {
    const trpc = useTRPC();
    const [params] = useCredentialsParams();
    return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useCreateCredential = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.credentials.create.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Credentials "${data.name}" Created`);
                queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
            },
            onError: (error) => {
                toast.error(`Failed to create credentials: ${error.message}`);
            }
        })
    );
};

export const useCreateCredentials = useCreateCredential;

export const useRemoveCredential = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.credentials.remove.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Credentials "${data.name}" Removed`);
                queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
                queryClient.invalidateQueries(trpc.credentials.getOne.queryFilter({ id: data.id }));
            },
            onError: (error) => {
                toast.error(`Failed to remove credentials: ${error.message}`);
            }
        })
    )

}

export const useSuspenseCredential = (id: string) => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }))
};

export const useUpdateCredential = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.credentials.update.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Credential "${data.name}" Saved`);
                queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
                queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
            },
            onError: (error) => {
                toast.error(`Failed to save credential: ${error.message}`);
            }
        })
    )

}

export const useCredentialsByType = (type: CredentialType) => {
    const trpc = useTRPC();
    return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};