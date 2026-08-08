"use client";

import { Node, NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../base-execution-node";
import { memo } from "react";
import { GlobeIcon } from "lucide-react";


type HttpRequestNodeData = {
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body: string;
    [key: string]: unknown;

};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
    const nodeData = props.data as HttpRequestNodeData;
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
        : "Not Configured";

    return (
        <BaseExecutionNode
            {...props}
            id={props.id}
            icon={GlobeIcon}
            name="HTTP Request"
            description={description}
            onSettings={() => { }}
            onDoubleClick={() => { }}
        />
    );
});

HttpRequestNode.displayName = "HttpRequestNode";