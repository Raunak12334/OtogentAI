import prisma from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const workflowsRouter = createTRPCRouter({
    create: premiumProcedure.mutation(({ ctx }) => {
        return prisma.workflow.create({
            data: {
                name: "Untitiled Workflow",
                userId: ctx.auth.user.id,
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
        .query(({ ctx, input }) => {
            return prisma.workflow.findUnique({
                where: { id: input.id, userId: ctx.auth.user.id }
            });
        }),
    getMany: protectedProcedure
        .query(({ ctx }) => {
            return prisma.workflow.findMany({
                where: { userId: ctx.auth.user.id }
            });
        }),
});
