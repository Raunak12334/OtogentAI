import { Composio } from "@composio/core";

const globalForComposio = global as unknown as {
    composio: Composio;
};

const composio =
    globalForComposio.composio ??
    new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

if (process.env.NODE_ENV !== "production") {
    globalForComposio.composio = composio;
}

export default composio;
