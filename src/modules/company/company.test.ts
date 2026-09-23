import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { createTestUser, getAuthToken } from "../../test/helpers.js";
import { create } from "domain";

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
        createdBy: user.id,
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

  it("returns 404 for a non-authorized company", async () => {
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
