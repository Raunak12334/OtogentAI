import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointer2Icon, MousePointerIcon } from "lucide-react";

export const ManualTriggerNode = memo((props: NodeProps) => {
    return (
        <>
            <BaseTriggerNode
                {...props}
                icon={MousePointerIcon}
                name="When Clicking 'Execute Workflow'"
            // status={nodeStatus}
            // onSettings={handleOpenSettings}
            //  // onDoubleClick={handleOpenSegsings}
            />
        </>
    );
});