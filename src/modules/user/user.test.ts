import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";

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
        password: "123",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ email: "keo@test.com" });
  });
});
