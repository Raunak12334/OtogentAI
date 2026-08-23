import composio from "@/lib/composio";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { ConnectedAccountStatuses } from "@composio/core";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const integrationsRouter = createTRPCRouter({
    /**
     * Returns all toolkits from the Composio catalog (minus Composio's own
     * internal toolkits which are infrastructure, not connectable apps).
     * Load all upfront; client-side search filters the list.
     */
    getToolkits: protectedProcedure.query(async () => {
        const result = await composio.toolkits.get({});
        return result.filter(
            (tk: { slug: string }) => !tk.slug.toLowerCase().includes("composio")
        );
    }),

    /**
     * Returns the current user's active connected accounts so we can show
     * "Connected" badges in the Integrations page. Only accounts in ACTIVE state
     * are returned.
     */
    getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.auth.user.id;
        return composio.connectedAccounts.list({
            userIds: [userId],
            statuses: [ConnectedAccountStatuses.ACTIVE],
        });
    }),

    /**
     * Returns raw tool schemas for a given toolkit.
     * Used by the Composio Action node dialog to populate the tool dropdown
     * and render dynamic argument fields.
     */
    getTools: protectedProcedure
        .input(z.object({ toolkitSlug: z.string().min(1) }))
        .query(async ({ input }) => {
            return composio.tools.getRawComposioTools({
                toolkits: [input.toolkitSlug],
            });
        }),

    /**
     * Initiates an OAuth connection for any toolkit using Composio-managed auth.
     * composio.toolkits.authorize() automatically:
     *   1. Looks up existing auth configs for the toolkit
     *   2. Creates a Composio-managed auth config if none exists
     *   3. Calls connectedAccounts.initiate() and returns the redirectUrl
     *
     * No manual per-toolkit configuration needed — works for every app
     * in the catalog out of the box.
     *
     * The userId comes exclusively from the server session — never trusted
     * from the client body.
     */
    initiateConnection: premiumProcedure
        .input(z.object({ toolkitSlug: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.auth.user.id;

            try {
                const connectionRequest = await composio.toolkits.authorize(
                    userId,
                    input.toolkitSlug
                );

                return {
                    redirectUrl: connectionRequest.redirectUrl,
                    connectionId: connectionRequest.id,
                };
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                if (
                    message.includes("Default auth config not found") ||
                    message.includes("does not have managed credentials") ||
                    message.includes("No auth configs found")
                ) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `"${input.toolkitSlug}" requires your own OAuth app credentials. Please create an Auth Config for it at https://app.composio.dev/auth-configs first.`,
                    });
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message,
                });
            }
        }),
});
