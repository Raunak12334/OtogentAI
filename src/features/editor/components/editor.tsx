"use client"

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NodeType } from "@/generated/prisma/enums";
import { ExecuteWorkflowButton } from "./execute-workflow-button";


export const EditorLoading = () => {
    return <LoadingView message="Loading Editor..." />
};

export const EditorError = () => {
    return <ErrorView message="Failed to Load Editor" />
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const setEditor = useSetAtom(editorAtom);
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const [nodes, setNodes] = useState(workflow.nodes);
    const [edges, setEdges] = useState(workflow.edges);

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)), []);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), []);
    const onConnect = useCallback((params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)), []);
    const hasManualTriggger = useMemo(() => {
        return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
    }, [nodes]);

    return (
        <div className="size-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeComponents}
                fitView
                proOptions={{ hideAttribution: true }}
                onInit={setEditor}
                snapGrid={[10, 10]}
                snapToGrid
                panOnScroll


            >

                <Background />
                <Controls />
                <Panel position="bottom-right">
                    <AddNodeButton />
                </Panel>
                {hasManualTriggger && (
                    <Panel position="top-right">
                        <ExecuteWorkflowButton workflowId={workflowId} />
                    </Panel>
                )}
            </ReactFlow>
        </div>
    )
};