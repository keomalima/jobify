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

describe("POST /api/offers", () => {
  it("creates an offer", async () => {
    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/offers",
      payload: {
        title: "Fullstack dev",
        companyId: company.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ title: "Fullstack dev" });
  });
});

describe("GET /api/offers/:id", () => {
  it("returns 404 for a missing offer", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/offers/does-not-exist",
    });
  });

  it("returns an existing offer", async () => {
    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon" },
    });
    const offer = await app.prisma.offer.create({
      data: {
        title: "Fullstack Dev",
        companyId: company.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/offers/${offer.id}`,
    });

    expect(response.statusCode).toBe(200);
  });
});
