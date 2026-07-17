"use client"

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getUsers.queryOptions());
  const testAI = useMutation(trpc.testAI.mutationOptions({
    onSuccess: () => {
      toast.success("AI job Queued")
    }
  }
  ));
  const create = useMutation(trpc.createUser.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.getUsers.queryOptions());
    },


  }));

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button disabled={testAI.isPending} onClick={() => testAI.mutate()} >
        TestAI
      </Button>
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

