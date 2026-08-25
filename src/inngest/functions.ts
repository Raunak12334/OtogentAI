import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { getExecutor } from "@/features/executions/lib/executor-registry";

export const executeWorkflow = inngest.createFunction(
    {
        id: "execute-workflow",
        onFailure: async ({ event, step }) => {
            return prisma.execution.update({
                where: { inngestEventId: event.data.event.id },
                data: {
                    status: ExecutionStatus.FAILED,
                    error: event.data.error.message,
                    errorStack: event.data.error.stack,
                },
            });
        },
        triggers: [{ event: "workflows/execute.workflow" }],
    },
    async ({ event, step }) => {
        const inngestEventId = event.id;
        const { workflowId, initialData } = event.data as {
            workflowId?: string;
            initialData?: Record<string, unknown>;
        };

        if (!inngestEventId || !workflowId) {
            throw new NonRetriableError("Event Id or Workflow ID is missing");
        }

        await step.run("create-execution", async () => {
            return prisma.execution.create({
                data: {
                    workflowId,
                    inngestEventId,
                }
            })
        })

        const { sortedNodes, userId } = await step.run("load-nodes", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                include: {
                    nodes: true,
                    connections: true,
                }
            });
            return {
                sortedNodes: topologicalSort(workflow.nodes, workflow.connections),
                userId: workflow.userId,
            };
        });

        let context: Record<string, unknown> = { ...(initialData || {}), __userId: userId };

        for (const node of sortedNodes) {
            const executor = getExecutor(node.type as NodeType);
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                step,
            });
        };

        await step.run("update-execution", async () => {
            return prisma.execution.update({
                where: { inngestEventId },
                data: {
                    status: ExecutionStatus.SUCCESS,
                    completedAt: new Date(),
                    output: context as Prisma.InputJsonValue,
                }
            })
        })


        return {
            workflowId,
            result: context,
        };
    },

);