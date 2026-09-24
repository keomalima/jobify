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

describe("POST /api/offers", () => {
  it("creates an offer", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon", createdBy: user.id },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/offers",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "Fullstack dev",
        companyId: company.id,
        createdBy: user.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ title: "Fullstack dev" });
  });

  it("returns 404 for attaching an offer to someone elses company", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, alice);

    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon", createdBy: bob.id },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/offers",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "Fullstack dev",
        companyId: company.id,
        createdBy: alice.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("GET /api/offers/:id", () => {
  it("returns 404 for a missing offer", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const response = await app.inject({
      method: "GET",
      url: "/api/offers/does-not-exist",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
  });

  it("returns an existing offer", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon", createdBy: user.id },
    });

    const offer = await app.prisma.offer.create({
      data: {
        title: "Fullstack Dev",
        createdBy: user.id,
        companyId: company.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
  });
});

describe("PATCH /api/offers/:id", () => {
  it("update an offer", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon", createdBy: user.id },
    });

    const offer = await app.prisma.offer.create({
      data: {
        title: "Fullstack dev",
        companyId: company.id,
        createdBy: user.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        skills: "React, Node, Typescript",
        salary: 690,
      },
    });

    const updated = await app.prisma.offer.findUnique({
      where: { id: offer.id },
    });

    expect(response.statusCode).toBe(200);
    expect(updated).toMatchObject({
      type: "INTERNSHIP",
      status: "APPLIED",
      salary: 690,
    });
  });

  it("returns 404 for modyfing an unauthorized company", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, alice);

    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon", createdBy: bob.id },
    });

    const offer = await app.prisma.offer.create({
      data: {
        title: "Fullstack dev",
        companyId: company.id,
        createdBy: bob.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        skills: "React, Node, Typescript",
        salary: 690,
      },
    });

    expect(response.statusCode).toBe(404);
  });

  it("returns 404 for modyfing createdBy id on an offer", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, bob);

    const company = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon", createdBy: bob.id },
    });

    const offer = await app.prisma.offer.create({
      data: {
        title: "Fullstack dev",
        companyId: company.id,
        createdBy: bob.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        skills: "React, Node, Typescript",
        salary: 690,
        createdBy: alice.id,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("returns 404 for modyfing companyId with someone else's company", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, bob);

    const bobCompany = await app.prisma.company.create({
      data: { name: "Acme", location: "Lyon", createdBy: bob.id },
    });

    const aliceCompany = await app.prisma.company.create({
      data: { name: "Furgo", location: "Paris", createdBy: alice.id },
    });

    const offer = await app.prisma.offer.create({
      data: {
        title: "Fullstack dev",
        companyId: bobCompany.id,
        createdBy: bob.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        skills: "React, Node, Typescript",
        salary: 690,
        companyId: aliceCompany.id,
      },
    });

    expect(response.statusCode).toBe(404);
  });
});
