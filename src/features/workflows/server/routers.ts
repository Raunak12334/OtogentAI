import { PAGINATION } from "@/config/constants";
import { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import z, { string } from "zod";
import { inngest } from "@/inngest/client";

export const workflowsRouter = createTRPCRouter({
    execute: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: input.id, userId: ctx.auth.user.id }
            });
            await inngest.send({
                name: "workflows/execute.workflow",
                data: {
                    workflowId: input.id,
                },
            });
            return workflow;
        }),

    create: premiumProcedure.mutation(({ ctx }) => {
        return prisma.workflow.create({
            data: {
                name: "Untitiled Workflow",
                userId: ctx.auth.user.id,
                nodes: {
                    create: {
                        type: NodeType.INITIAL,
                        position: { x: 0, y: 0 },
                        name: "Initial Node",
                    }
                }
            },
        });
    }),
    remove: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            }))
        .mutation(({ ctx, input }) => {
            return prisma.workflow.delete({
                where: {
                    userId: ctx.auth.user.id,
                    id: input.id,
                },
            });
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                nodes: z.array(
                    z.object(
                        {
                            id: string(),
                            type: z.string().nullish(),
                            position: z.object({ x: z.number(), y: z.number() }),
                            data: z.record(z.string(), z.any()).optional(),
                        }
                    )
                ),
                edges: z.array(
                    z.object({
                        source: z.string(),
                        target: z.string(),
                        sourceHandle: z.string().nullish(),
                        targetHandle: z.string().nullish(),
                    })
                ),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, nodes, edges } = input;
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id, userId: ctx.auth.user.id },
            });
            return await prisma.$transaction(async (tx) => {
                await tx.node.deleteMany({
                    where: { workflowId: id },
                });
                await tx.node.createMany({
                    data: nodes.map((node) => ({
                        id: node.id,
                        workflowId: id,
                        type: node.type as NodeType,
                        name: node.type || "unknown",
                        position: node.position,
                        data: node.data || {},
                    })),
                });
                await tx.connection.createMany({
                    data: edges.map((edge) => ({
                        workflowId: id,
                        fromNodeId: edge.source,
                        toNodeId: edge.target,
                        fromOutput: edge.sourceHandle || "main",
                        toInput: edge.targetHandle || "main",
                    })),
                });
                await tx.workflow.update({
                    where: { id },
                    data: { updatedAt: new Date() },
                });

                return workflow;
            })


        }),

    updateName: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1),
            })
        )
        .mutation(({ ctx, input }) => {
            return prisma.workflow.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: { name: input.name },
            });
        }),
    getOne: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            }))
        .query(async ({ ctx, input }) => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: input.id, userId: ctx.auth.user.id },
                include: { nodes: true, connections: true }
            });
            const nodes: Node[] = workflow.nodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position as { x: number, y: number },
                data: (node.data as Record<string, unknown>) || {},
            }));
            const edges: Edge[] = workflow.connections.map((connection) => ({
                id: connection.id,
                source: connection.fromNodeId,
                target: connection.toNodeId,
                sourceHandle: connection.fromOutput,
                targetHandle: connection.toInput,
            }));

            return {
                id: workflow.id,
                name: workflow.name,
                nodes,
                edges,
            };
        }),
    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE), search: z.string().default(""),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;
            const [items, totalCount] = await Promise.all([
                prisma.workflow.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                }),
                prisma.workflow.count({
                    where: {
                        userId: ctx.auth.user.id
                    },
                }),
            ]);

            const totalPages =
                Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;
            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            };

        }),
});
