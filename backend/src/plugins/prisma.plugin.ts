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
  const isTest = process.env.NODE_ENV === "test";

  const databaseUrl = isTest
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      isTest ? "DATABASE_URL_TEST is required" : "DATABASE_URL is required",
    );
  }
  const adapter = new PrismaPg({ connectionString: databaseUrl });

  const prisma = new PrismaClient({ adapter });

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
}
