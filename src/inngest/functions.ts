import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";

export const executeWorkflow = inngest.createFunction(
    {
        id: "execute-workflow",
        triggers: [{ event: "workflows/execute.workflow" }],
    },
    async ({ event, step }) => {
        const { workflowId, initialData } = event.data as {
            workflowId?: string;
            initialData?: Record<string, unknown>;
        };

        if (!workflowId) {
            throw new NonRetriableError("Workflow ID is missing");
        }


        const sortedNodes = await step.run("load-nodes", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                include: {
                    nodes: true,
                    connections: true,
                }
            });
            return topologicalSort(workflow.nodes, workflow.connections);
        });

        let context = initialData || {};

        for (const node of sortedNodes) {
            const executor = getExecutor(node.type as NodeType);
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                step,
            });
        };



        return {
            workflowId,
            result: context,
        };
    },

);