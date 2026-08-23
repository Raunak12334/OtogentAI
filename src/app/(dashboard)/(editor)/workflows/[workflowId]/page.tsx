import { Editor, EditorError, EditorLoading } from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { WorkflowsError, WorkflowsLoading } from "@/features/workflows/components/workflows";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{ workflowId: string }>;
}

const Page = async ({ params }: PageProps) => {
    await requireAuth();
    const { workflowId } = await params;
    prefetchWorkflow(workflowId);

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<EditorError />}>
                <Suspense fallback={<EditorLoading />}>
                    <div className="flex flex-col h-screen w-full overflow-hidden">
                        <EditorHeader workflowId={workflowId} />
                        <main className="flex-1 h-[calc(100vh-3.5rem)] w-full relative">
                            <Editor workflowId={workflowId} />
                        </main>
                    </div>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    );
};

export default Page;