import { workflowsParams } from "../params";
import { useQueryStates } from "nuqs";

export const useWorkflowsParams = () => {
    return useQueryStates(workflowsParams)
}   