"use client"

import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";
import { caller } from "@/trpc/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getUsers.queryOptions());
  const create = useMutation(trpc.createUser.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.getUsers.queryOptions());
    },

  }));

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <Button>
        Logout
      </Button>
    </div>
  );
};

export default Page;

