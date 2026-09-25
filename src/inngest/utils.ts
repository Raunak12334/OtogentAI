import { Connection, Node } from "@/generated/prisma/client";
import toposort from "toposort";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";

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

export const sendWorkflowExecution = async (data: {
    workflowId: string;
    [key: string]: any;

}) => {
    return inngest.send({
        name: "workflows/execute.workflow",
        data,
        id: createId(),
    })
}