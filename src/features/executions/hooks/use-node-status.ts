import { NodeStatus } from "@/components/react-flow/node-status-indicator";
import type { Realtime } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useEffect, useState } from "react";

interface UseNodeStatusOptions {
    nodeId: string;
    channel: string;
    topic: string;
    refreshToken: () => Promise<Realtime.Subscribe.Token<any, any>>;
}

export const useNodeStatus = ({
    nodeId,
    channel,
    topic,
    refreshToken,
}: UseNodeStatusOptions) => {
    const [status, setStatus] = useState<NodeStatus>("initial");

    const { data } = useInngestSubscription({
        refreshToken,
        enabled: true,
    });

    useEffect(() => {
        if (!data?.length) {
            return;
        }

        const matchingMessages = data.filter(
            (msg) =>
                msg.kind === "data" &&
                msg.channel === channel &&
                msg.topic === topic &&
                (msg.data as { nodeId?: string })?.nodeId === nodeId,
        );

        const latestMessage = matchingMessages[matchingMessages.length - 1];

        if (latestMessage?.kind === "data") {
            setStatus((latestMessage.data as { status: NodeStatus }).status);
        }
    }, [data, nodeId, channel, topic]);

    return status;
};