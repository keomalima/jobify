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

describe("POST /api/companies", () => {
  it("creates a company", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/companies",
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
    const response = await app.inject({
      method: "GET",
      url: "/api/companies/does-not-exist",
    });
  });

  it("returns an existing company", async () => {
    const company = await app.prisma.company.create({
      data: {
        name: "Acme",
        location: "Lyon",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${company.id}`,
    });

    expect(response.statusCode).toBe(200);
  });
});
