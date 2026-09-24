import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateUserInput, LoginInput } from "./user.schema.js";
import { userService } from "./user.service.js";
import { verifyPassword } from "../../plugins/hash.plugin.js";

async function authenticateHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch (error: any) {
    return reply.code(401).send({ message: "Unauthorized" });
  }
}

async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
) {
  try {
    const userData = request.body;

    const user = await userService.findUserByEmail(
      request.server.prisma,
      userData.email,
    );

    if (user) {
      return reply.code(409).send({
        message: "Email already registered",
      });
    }

    const newUser = await userService.createUser(
      request.server.prisma,
      userData,
    );

    const token = request.server.jwt.sign(
      {
        sub: newUser.id,
      },
      { expiresIn: "1h" },
    );

    return reply.code(201).send({ ...newUser, token });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Failed to create user" });
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

    const token = request.server.jwt.sign(
      { sub: user.id },
      { expiresIn: "1h" },
    );

    const { password, salt, ...safeUser } = user;

    return reply.code(200).send({ ...safeUser, token });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Failed to login user" });
  }
}

async function getUserHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub;

    const user = await userService.findUserById(request.server.prisma, userId);
    if (!user) {
      return reply.code(404).send({
        message: "User not found or unauthorized",
      });
    }

    return user;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Failed to fetch user" });
  }
}

// =====================
// Export Controller Object
// =====================

export const userController = {
  createUserHandler,
  loginUserHandler,
  authenticateHandler,
  getUserHandler,
};
