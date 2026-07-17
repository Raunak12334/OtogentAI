import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
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