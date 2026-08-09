"use client"

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";


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
                <Panel position="top-right">
                    <AddNodeButton />
                </Panel>
            </ReactFlow>
        </div>
    )
};