// src/test/helpers.ts
import type { FastifyInstance } from "fastify";

export async function createTestUser(app: FastifyInstance) {
  return app.prisma.user.create({
    data: {
      name: "Keo",
      surname: "Lima",
      password: "Password123*",
      salt: "123",
      email: `test-${Date.now()}-${Math.random()}@test.com`,
    },
  });
}
