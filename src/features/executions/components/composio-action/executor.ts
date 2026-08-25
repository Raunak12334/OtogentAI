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

                        // If user entered JSON or boolean/number, try to parse
                        if (compiled === "true") {
                            resolvedArgs[key] = true;
                        } else if (compiled === "false") {
                            resolvedArgs[key] = false;
                        } else if (!isNaN(Number(compiled)) && compiled.trim() !== "") {
                            resolvedArgs[key] = Number(compiled);
                        } else {
                            try {
                                if (
                                    (compiled.startsWith("{") && compiled.endsWith("}")) ||
                                    (compiled.startsWith("[") && compiled.endsWith("]"))
                                ) {
                                    resolvedArgs[key] = JSON.parse(compiled);
                                } else {
                                    resolvedArgs[key] = compiled;
                                }
                            } catch {
                                resolvedArgs[key] = compiled;
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
