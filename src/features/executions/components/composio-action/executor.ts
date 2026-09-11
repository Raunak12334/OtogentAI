import type { NodeExecutor } from "@/features/executions/types";
import { composioActionChannel } from "@/inngest/channels/composio-action";
import composio from "@/lib/composio";
import prisma from "@/lib/db";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

export type ComposioActionData = {
    variableName?: string;
    toolkitSlug?: string;
    toolkitName?: string;
    toolkitLogo?: string;
    actionSlug?: string;
    actionArguments?: Record<string, unknown>;
};

export const composioActionExecutor: NodeExecutor<ComposioActionData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    await step.realtime.publish(
        `publish-loading-${nodeId}`,
        composioActionChannel.status,
        {
            nodeId,
            status: "loading",
        }
    );

    try {
        const result = await step.run(
            `composio-action-${data.variableName || nodeId}`,
            async () => {
                if (!data.actionSlug) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        composioActionChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "Composio Action node: No action selected"
                    );
                }

                if (!data.variableName) {
                    await step.realtime.publish(
                        `publish-error-${nodeId}`,
                        composioActionChannel.status,
                        {
                            nodeId,
                            status: "error",
                        }
                    );
                    throw new NonRetriableError(
                        "Composio Action node: Variable name not configured"
                    );
                }

                // Resolve userId
                let userId = context.__userId as string | undefined;
                if (!userId) {
                    const node = await prisma.node.findUnique({
                        where: { id: nodeId },
                        include: { workflow: true },
                    });
                    userId = node?.workflow?.userId;
                }

                if (!userId) {
                    throw new NonRetriableError(
                        "Composio Action node: Could not determine workflow user ID"
                    );
                }

                // Interpolate arguments using Handlebars against workflow context
                const rawArgs = data.actionArguments || {};
                const resolvedArgs: Record<string, unknown> = {};

                for (const [key, val] of Object.entries(rawArgs)) {
                    if (typeof val === "string") {
                        const template = Handlebars.compile(val);
                        const compiled = template(context);

                        const trimmed = compiled.trim();
                        // If user entered JSON or boolean/number, try to parse
                        if (trimmed === "true") {
                            resolvedArgs[key] = true;
                        } else if (trimmed === "false") {
                            resolvedArgs[key] = false;
                        } else if (!isNaN(Number(trimmed)) && trimmed !== "") {
                            resolvedArgs[key] = Number(trimmed);
                        } else {
                            try {
                                if (
                                    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
                                    (trimmed.startsWith("[") && trimmed.endsWith("]"))
                                ) {
                                    resolvedArgs[key] = JSON.parse(trimmed);
                                } else {
                                    resolvedArgs[key] = compiled;
                                }
                            } catch {
                                resolvedArgs[key] = compiled;
                            }
                        }

                        // Auto-extract ID if a full Google Drive or Google Sheets URL was pasted
                        if (typeof resolvedArgs[key] === "string") {
                            const str = resolvedArgs[key] as string;
                            if (str.includes("drive.google.com") || str.includes("docs.google.com")) {
                                const idMatch = str.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                if (idMatch) {
                                    resolvedArgs[key] = idMatch[1];
                                }
                            }
                        }
                    } else {
                        resolvedArgs[key] = val;
                    }
                }

                const executionResponse = await composio.tools.execute(
                    data.actionSlug,
                    {
                        userId,
                        arguments: resolvedArgs,
                        dangerouslySkipVersionCheck: true,
                    }
                );

                const responseData =
                    (executionResponse as { data?: unknown }).data ??
                    executionResponse;

                return {
                    ...context,
                    [data.variableName]: responseData,
                };
            }
        );

        await step.realtime.publish(
            `publish-success-${nodeId}`,
            composioActionChannel.status,
            {
                nodeId,
                status: "success",
            }
        );

        return result;
    } catch (error) {
        await step.realtime.publish(
            `publish-error-${nodeId}`,
            composioActionChannel.status,
            {
                nodeId,
                status: "error",
            }
        );
        throw error;
    }
};
