import type { PrismaClient } from "@prisma/client";
import type { CreateUserInput } from "./user.schema.js";
import { hashPassword } from "../../plugins/hash.plugin.js";

async function createUser(prisma: PrismaClient, data: CreateUserInput) {
  const { hash, salt } = hashPassword(data.password);

  return prisma.user.create({
    data: {
      ...data,
      salt,
      password: hash,
    },
  });
}

async function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

// =====================
// Export Service Object
// =====================

export const userService = {
  createUser,
  findUserByEmail,
};
