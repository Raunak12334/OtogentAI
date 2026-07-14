import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Page = async () => {
  await requireAuth();
  const data = await caller.getUsers()

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button>
        Logout
      </Button>
    </div>
  );
};

export default Page;

