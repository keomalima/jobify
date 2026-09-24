import type { FastifyInstance } from "fastify";
import { hashPassword } from "../plugins/hash.plugin.js";

export async function getAuthToken(app: FastifyInstance, user: { id: string }) {
  return app.jwt.sign({ sub: user.id }, { expiresIn: "1h" });
}

export async function createTestUser(app: FastifyInstance, email?: string) {
  const plainPassword = "Password123*";
  const { hash, salt } = hashPassword(plainPassword);

  const user = await app.prisma.user.create({
    data: {
      name: "Keo",
      surname: "Lima",
      password: hash,
      salt,
      email: email ?? `test-${Date.now()}-${Math.random()}@test.com`,
    },
  });

  return { ...user, plainPassword };
}

export async function resetTestDatabase(app: FastifyInstance) {
  await app.prisma.$transaction([
    app.prisma.offer.deleteMany(),
    app.prisma.company.deleteMany(),
    app.prisma.user.deleteMany(),
  ]);
}
