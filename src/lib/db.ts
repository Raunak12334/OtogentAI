import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
    pool: Pool;
};

function createPrismaClient() {
    const pool =
        globalForPrisma.pool ||
        new Pool({
            connectionString: process.env.DATABASE_URL!,
            max: 10, // max connections in pool
            idleTimeoutMillis: 60_000, // close idle connections after 60s
            connectionTimeoutMillis: 10_000, // fail if can't connect in 10s
        });

    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.pool = pool;
    }

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;   