import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateUserInput, LoginInput } from "./user.schema.js";
import { userService } from "./user.service.js";
import { verifyPassword } from "../../plugins/hash.plugin.js";

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

async function loginUserHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  try {
    const data = request.body;
    const prisma = request.server.prisma;

    const user = await userService.findUserByEmail(prisma, data.email);
    if (!user) {
      return reply.code(400).send({
        message: "Invalid email or password",
      });
    }

    const isValid = verifyPassword(data.password, user.password, user.salt);
    if (!isValid) {
      return reply.code(400).send({
        message: "Invalid email or password",
      });
    }

    const token = request.server.jwt.sign({ sub: user.id, email: user.email });

    const { password, salt, ...safeUser } = user;

    return reply.code(200).send({ ...safeUser, token });
  } catch (error) {
    reply.code(500).send({ message: "Failed to login user" });
  }
}

// =====================
// Export Controller Object
// =====================

export const userController = {
  createUserHandler,
  loginUserHandler,
};
