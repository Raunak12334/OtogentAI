import { channel, staticSchema } from "inngest/realtime";

export const HTTP_REQUEST_CHANNEL_NAME = "http-request-execution";
export const httpRequestChannel = channel({
    name: HTTP_REQUEST_CHANNEL_NAME,
    topics: {
        status: {
            schema: staticSchema<{
                nodeId: string;
                status: "loading" | "success" | "error";
            }>(),
        },
    },
});
