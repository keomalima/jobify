import type { FastifyInstance } from "fastify";
import { hashPassword } from "../plugins/hash.plugin.js";

export async function getAuthToken(
  app: FastifyInstance,
  user: { id: string; email: string },
) {
  return app.jwt.sign({ id: user.id, email: user.email });
}

export async function createTestUser(app: FastifyInstance) {
  const plainPassword = "Password123*";
  const { hash, salt } = hashPassword(plainPassword);

  const user = await app.prisma.user.create({
    data: {
      name: "Keo",
      surname: "Lima",
      password: hash,
      salt,
      email: `test-${Date.now()}-${Math.random()}@test.com`,
    },
  });

  return { ...user, plainPassword };
}
