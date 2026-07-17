import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const appRouter = createTRPCRouter({
    testAI: protectedProcedure.mutation(async () => {
        await inngest.send({ name: "process/ai" })
        return { success: true, message: "job queued" }
    }),

    getUsers: protectedProcedure.query(({ ctx }) => {
        return prisma.user.findMany();
    }),
    createUser: protectedProcedure.mutation(async () => {
        await inngest.send({
            name: "app/task.created",
            data: { id: "event.data.id" },
        });
    }

    )

});

export type AppRouter = typeof appRouter;