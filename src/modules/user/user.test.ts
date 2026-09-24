import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { createTestUser, resetTestDatabase } from "../../test/helpers.js";
import { create } from "domain";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await resetTestDatabase(app);
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

describe("POST /api/login", () => {
  it("logins an user", async () => {
    const user = await createTestUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: {
        email: user.email,
        password: user.plainPassword,
      },
    });

    expect(response.statusCode).toBe(200);
  });

  it("tries to create an user with the same email", async () => {
    const user = await createTestUser(app, "keo@test.com");

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

    console.log(response.json())
    expect(response.statusCode).toBe(409);
  });
});
