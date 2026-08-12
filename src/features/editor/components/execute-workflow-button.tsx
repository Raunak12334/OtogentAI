import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { Play } from "lucide-react";

export const ExecuteWorkflowButton = ({ workflowId }: { workflowId: string }) => {
    const executeWorkflow = useExecuteWorkflow();
    const handleExecute = () => {
        executeWorkflow.mutate({ id: workflowId });
    };
    return (
        <Button onClick={handleExecute} disabled={executeWorkflow.isPending}>
            <Play className="size-4" />
            Execute Workflow
        </Button>
    )
};