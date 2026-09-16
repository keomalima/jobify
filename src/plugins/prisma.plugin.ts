import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default async function prismaPlugin(fastify: FastifyInstance) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
}
