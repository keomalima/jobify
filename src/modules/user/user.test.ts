import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { createTestUser } from "../../test/helpers.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await app.prisma.offer.deleteMany();
  await app.prisma.company.deleteMany();
  await app.prisma.user.deleteMany();
});

describe("POST /api/register", () => {
  it("creates an user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/register",
      payload: {
        name: "Keo",
        surname: "Lima",
        email: "keo@test.com",
        password: "Password123*",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ email: "keo@test.com" });
  });
});

describe("POST /api/register/login", () => {
  it("logins an user", async () => {
    const user = await createTestUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/register/login",
      payload: {
        email: user.email,
        password: user.password,
      },
    });

    expect(response.statusCode).toBe(200);
  });
});
