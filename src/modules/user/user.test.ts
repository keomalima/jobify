import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { createTestUser, resetTestDatabase } from "../../test/helpers.js";

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
    const body = response.json();

    expect(body).toHaveProperty("token", expect.any(String));
    expect(body).not.toHaveProperty("password");
    expect(body).not.toHaveProperty("salt");
  });

  it("returns 409 when the email is already registered", async () => {
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

    expect(response.json()).toEqual({
      message: "Email already registered",
    });
    expect(response.statusCode).toBe(409);
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
    const body = response.json();

    expect(body).toHaveProperty("token", expect.any(String));
    expect(body).not.toHaveProperty("password");
    expect(body).not.toHaveProperty("salt");
  });

  it("returns 400 for invalid email login", async () => {
    const user = await createTestUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: {
        email: "random@email.com",
        password: user.plainPassword,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("returns 400 for invalid password login", async () => {
    const user = await createTestUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: {
        email: user.email,
        password: "123",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
