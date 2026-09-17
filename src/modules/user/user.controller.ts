import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateUserInput } from "./user.schema.js";
import { userService } from "./user.service.js";

async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
) {
  try {
    const userData = request.body;

    const newUser = await userService.createUser(
      request.server.prisma,
      userData,
    );

    return reply.code(201).send(newUser);
  } catch (error) {
    reply.code(500).send({ message: "Failed to create user" });
  }
}

// =====================
// Export Controller Object
// =====================

export const userController = {
  createUserHandler,
};
