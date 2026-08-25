import { requireAuth } from "@/lib/auth-utils";
import {
    prefetchConnectedAccounts,
    prefetchToolkits,
} from "@/features/integrations/server/prefetch";
import {
    IntegrationsError,
    IntegrationsList,
    IntegrationsLoading,
} from "@/features/integrations/ui/integrations";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
    await requireAuth();
    prefetchToolkits();
    prefetchConnectedAccounts();

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<IntegrationsError />}>
                <Suspense fallback={<IntegrationsLoading />}>
                    <IntegrationsList />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    );
};

export default Page;
