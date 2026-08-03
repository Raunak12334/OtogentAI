"use client"

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspensseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
    return <LoadingView message="Loading Editor..." />
};

export const EditorError = () => {
    return <ErrorView message="Failed to Load Editor" />
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspensseWorkflow(workflowId);

    return (
        <p>
            {JSON.stringify(workflow, null, 2)}
        </p>
    )
};