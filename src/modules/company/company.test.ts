import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import {
  createTestUser,
  getAuthToken,
  resetTestDatabase,
} from "../../test/helpers.js";

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

describe("POST /api/companies", () => {
  it("creates a company", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const response = await app.inject({
      method: "POST",
      url: "/api/companies",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: "Acme",
        location: "Lyon",
        description: "Solve atomic problems",
        size: 10,
        website: "https://acme.com",
        linkedin: null,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ name: "Acme" });
  });
});

describe("GET /api/companies/:id", () => {
  it("returns 404 for a missing company", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const response = await app.inject({
      method: "GET",
      url: "/api/companies/does-not-exist",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
  });

  it("returns a list of companies", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company1 = await app.prisma.company.create({
      data: {
        name: "Acme",
        location: "Lyon",
        createdBy: user.id,
      },
    });

    const company2 = await app.prisma.company.create({
      data: {
        name: "Furgo",
        location: "Paris",
        createdBy: user.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/companies/",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
  });

  it("returns 200 for fetching user with no companies", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const response = await app.inject({
      method: "GET",
      url: "/api/companies/",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
  });

  it("returns an existing company", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company = await app.prisma.company.create({
      data: {
        name: "Acme",
        location: "Lyon",
        createdBy: user.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${company.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
  });

  it("returns 401 for missing token", async () => {
    const user = await createTestUser(app);

    const company = await app.prisma.company.create({
      data: {
        name: "Acme",
        location: "Lyon",
        createdBy: user.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${company.id}`,
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 401 for an expired token", async () => {
    const user = await createTestUser(app);

    const token = app.jwt.sign({
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/offers/some-offer-id",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      message: "Unauthorized",
    });
  });

  it("returns 401 for invalid token", async () => {
    const user = await createTestUser(app);

    const company = await app.prisma.company.create({
      data: {
        name: "Acme",
        location: "Lyon",
        createdBy: user.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${company.id}`,
      headers: { authorization: `Bearer 123` },
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 404 for fetching a non-authorized company", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);

    const token = await getAuthToken(app, bob);

    const company = await app.prisma.company.create({
      data: {
        name: "Acme",
        location: "Lyon",
        createdBy: alice.id,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${company.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
  });
});
