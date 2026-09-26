import { Connection, Node, Prisma } from "@/generated/prisma/client";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import toposort from "toposort";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";
import prisma from "@/lib/db";
import { getExecutor } from "@/features/executions/lib/executor-registry";

export const topologicalSort = (
    nodes: Node[],
    connections: Connection[],
): Node[] => {
    if (nodes.length === 0) return [];
    if (connections.length === 0) return nodes;

    const edges: [string, string][] = connections.map((conn) => [
        conn.fromNodeId,
        conn.toNodeId,
    ]);

    let sortedNodeIds: string[];
    try {
        sortedNodeIds = toposort(edges);
        sortedNodeIds = [...new Set(sortedNodeIds)];
    } catch (error) {
        if (error instanceof Error && error.message.includes("Cyclic")) {
            throw new Error("Workflow contains a cycle");
        }
        throw error;
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const sortedNodes = sortedNodeIds
        .map((id) => nodeMap.get(id)!)
        .filter(Boolean);

    const sortedNodeIdsSet = new Set(sortedNodeIds);
    const unconnectedNodes = nodes.filter(
        (node) => !sortedNodeIdsSet.has(node.id)
    );

    return [...sortedNodes, ...unconnectedNodes];
};

export const runWorkflowDirectly = async (
    workflowId: string,
    initialData: Record<string, unknown> = {}
) => {
    const inngestEventId = createId();

    const execution = await prisma.execution.create({
        data: {
            workflowId,
            inngestEventId,
            status: ExecutionStatus.RUNNING,
        },
    });

    try {
        const workflow = await prisma.workflow.findUniqueOrThrow({
            where: { id: workflowId },
            include: {
                nodes: true,
                connections: true,
            },
        });

        const sortedNodes = topologicalSort(workflow.nodes, workflow.connections);
        let context: Record<string, unknown> = {
            ...initialData,
            __userId: workflow.userId,
        };

        const dummyStep = {
            run: async (_name: string, fn: () => Promise<any>) => fn(),
            realtime: {
                publish: async () => {},
            },
        };

        for (const node of sortedNodes) {
            const executor = getExecutor(node.type as NodeType);
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                step: dummyStep as any,
            });
        }

        await prisma.execution.update({
            where: { id: execution.id },
            data: {
                status: ExecutionStatus.SUCCESS,
                completedAt: new Date(),
                output: context as Prisma.InputJsonValue,
            },
        });

        return { success: true, result: context };
    } catch (error: any) {
        await prisma.execution.update({
            where: { id: execution.id },
            data: {
                status: ExecutionStatus.FAILED,
                completedAt: new Date(),
                error: error?.message || String(error),
                errorStack: error?.stack || "",
            },
        });
        throw error;
    }
};

export const sendWorkflowExecution = async (data: {
    workflowId: string;
    [key: string]: any;
}) => {
    if (!process.env.INNGEST_EVENT_KEY && process.env.NODE_ENV === "production") {
        return await runWorkflowDirectly(data.workflowId, data.initialData || {});
    }
    try {
        return await inngest.send({
            name: "workflows/execute.workflow",
            data,
            id: createId(),
        });
    } catch (err) {
        console.warn(
            "inngest.send failed, executing workflow directly:",
            err
        );
        return await runWorkflowDirectly(data.workflowId, data.initialData || {});
    }
};