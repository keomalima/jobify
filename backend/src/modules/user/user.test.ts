import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { createTestUser, resetTestDatabase } from "../../test/helpers.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

beforeEach(async () => {
  await resetTestDatabase(app);
});

afterAll(async () => {
  await app?.close();
});

describe("POST /api/register", () => {
  it("creates a user", async () => {
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
    await createTestUser(app, "keo@test.com");

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
    expect(
      await app.prisma.user.count({ where: { email: "keo@test.com" } }),
    ).toBe(1);
  });

  it.each([
    { label: "invalid email", change: { email: "invalid" } },
    { label: "short password", change: { password: "Ab1!" } },
    {
      label: "password without uppercase",
      change: { password: "password123!" },
    },
    {
      label: "password without special character",
      change: { password: "Password123" },
    },
    { label: "short name", change: { name: "ab" } },
    { label: "missing required fields", change: null },
  ])("returns 400 for $label without creating a user", async ({ change }) => {
    const payload =
      change === null
        ? {}
        : {
            name: "Alice",
            surname: "Martin",
            email: "alice@test.com",
            password: "Password123*",
            ...change,
          };
    const response = await app.inject({
      method: "POST",
      url: "/api/register",
      payload,
    });
    expect(response.statusCode).toBe(400);
    expect(await app.prisma.user.count()).toBe(0);
  });
});

describe("POST /api/login", () => {
  it("logs in a user", async () => {
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

  it("returns 400 for an unknown email", async () => {
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

  it("returns 400 for an incorrect password", async () => {
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

describe("GET /api/me", () => {
  it("returns the logged-in user's profile without password or salt", async () => {
    // Create another account first to catch an unfiltered first-user lookup.
    await createTestUser(app);
    const user = await createTestUser(app);
    const login = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: { email: user.email, password: user.plainPassword },
    });
    expect(login.statusCode).toBe(200);

    const response = await app.inject({
      method: "GET",
      url: "/api/me",
      headers: { authorization: `Bearer ${login.json().token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
    });
    expect(response.json()).not.toHaveProperty("password");
    expect(response.json()).not.toHaveProperty("salt");
  });

  it.each(["missing", "invalid", "expired"])(
    "returns 401 when the token is %s",
    async (kind) => {
      const user = await createTestUser(app);
      const token = kind === "expired"
        ? app.jwt.sign({ sub: user.id, exp: Math.floor(Date.now() / 1000) - 60 })
        : "invalid-token";
      const headers = kind === "missing"
        ? {}
        : { authorization: `Bearer ${token}` };

      const response = await app.inject({
        method: "GET",
        url: "/api/me",
        headers,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ message: "Unauthorized" });
    },
  );

  it("returns 404 when the token belongs to a deleted user", async () => {
    const user = await createTestUser(app);
    const login = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: { email: user.email, password: user.plainPassword },
    });
    expect(login.statusCode).toBe(200);
    await app.prisma.user.delete({ where: { id: user.id } });
    // Leave another account present to ensure it cannot be returned instead.
    await createTestUser(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/me",
      headers: { authorization: `Bearer ${login.json().token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: "User not found or unauthorized" });
  });
});
