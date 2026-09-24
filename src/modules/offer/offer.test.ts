import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
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
  await app.ready();
});
beforeEach(async () => {
  await resetTestDatabase(app);
});
afterAll(async () => {
  await app?.close();
});

async function createCompany(userId: string) {
  return app.prisma.company.create({
    data: { name: "Acme", location: "Lyon", createdBy: userId },
  });
}

async function createOffer(userId: string, companyId: string) {
  return app.prisma.offer.create({
    data: {
      title: "Fullstack dev", companyId, createdBy: userId,
      type: "INTERNSHIP", status: "APPLIED", skills: "React, Node", salary: null,
    },
  });
}

describe("POST /api/offers", () => {
  it.each([
    { label: "omitted", details: {} },
    { label: "explicitly null", details: { type: null, skills: null, salary: null } },
  ])("creates a draft with $label details and the default status", async ({ details }) => {
    const user = await createTestUser(app);
    const company = await createCompany(user.id);
    const headers = { authorization: `Bearer ${await getAuthToken(app, user)}` };
    const response = await app.inject({
      method: "POST",
      url: "/api/offers",
      headers,
      payload: { title: "Draft offer", companyId: company.id, ...details },
    });
    expect(response.statusCode).toBe(201);
    const expected = {
      id: response.json().id, title: "Draft offer", companyId: company.id,
      type: null, skills: null, salary: null, status: "WISHLIST",
    };
    expect(await app.prisma.offer.findUnique({ where: { id: expected.id } }))
      .toMatchObject({ ...expected, createdBy: user.id });
    const fetched = await app.inject({ method: "GET", url: `/api/offers/${expected.id}`, headers });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.json()).toMatchObject(expected);
    const list = await app.inject({ method: "GET", url: "/api/offers/", headers });
    expect(list.statusCode).toBe(200);
    expect(list.json()).toEqual([expect.objectContaining(expected)]);
  });

  it.each([
    { label: "zero salary", details: { salary: 0 } },
    { label: "explicit status", details: { salary: null, status: "INTERVIEWING" } },
  ])("accepts $label on creation", async ({ details }) => {
    const user = await createTestUser(app);
    const company = await createCompany(user.id);
    const response = await app.inject({
      method: "POST", url: "/api/offers",
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
      payload: { title: "Draft offer", companyId: company.id, ...details },
    });
    expect(response.statusCode).toBe(201);
    expect(await app.prisma.offer.findUnique({ where: { id: response.json().id } }))
      .toMatchObject(details);
  });

  it.each([
    { label: "null status", change: { status: null, salary: null } },
    { label: "invalid company UUID", change: { companyId: "invalid", salary: null } },
  ])("rejects $label on creation", async ({ change }) => {
    const user = await createTestUser(app);
    const company = await createCompany(user.id);
    const response = await app.inject({
      method: "POST", url: "/api/offers",
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
      payload: { title: "Draft offer", companyId: company.id, ...change },
    });
    expect(response.statusCode).toBe(400);
    expect(await app.prisma.offer.count()).toBe(0);
  });

  it("creates an offer", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company = await createCompany(user.id);

    const response = await app.inject({
      method: "POST",
      url: "/api/offers",
      headers: { authorization: `Bearer ${token}` },
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

  it("returns 404 for attaching an offer to someone elses company", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, alice);

    const company = await createCompany(bob.id);

    const response = await app.inject({
      method: "POST",
      url: "/api/offers",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "Fullstack dev",
        companyId: company.id,
        type: "INTERNSHIP",
        status: "APPLIED",
        skills: "React, Node",
        salary: null,
      },
    });

    expect(response.statusCode).toBe(404);
  });

  it("uses the token owner even when the request supplies another owner", async () => {
    const user = await createTestUser(app);
    const other = await createTestUser(app);
    const company = await createCompany(user.id);
    const response = await app.inject({
      method: "POST",
      url: "/api/offers",
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
      payload: {
        title: "Fullstack dev", companyId: company.id, createdBy: other.id,
        type: "INTERNSHIP", status: "APPLIED", skills: "React", salary: null,
      },
    });
    expect(response.statusCode).toBe(201);
    expect(await app.prisma.offer.findUnique({ where: { id: response.json().id } }))
      .toMatchObject({ createdBy: user.id, companyId: company.id });
  });

  it("rejects a nonexistent company without creating an offer", async () => {
    const user = await createTestUser(app);
    const response = await app.inject({
      method: "POST", url: "/api/offers",
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
      payload: {
        title: "Fullstack dev", companyId: randomUUID(), type: "INTERNSHIP",
        status: "APPLIED", skills: "React", salary: null,
      },
    });
    expect(response.statusCode).toBe(404);
    expect(await app.prisma.offer.count()).toBe(0);
  });

  it.each([
    { label: "missing fields", payload: {} },
    { label: "invalid status", payload: { title: "Developer", companyId: randomUUID(), type: "INTERNSHIP", status: "INVALID", skills: "React", salary: null } },
  ])("rejects creation with $label", async ({ payload }) => {
    const user = await createTestUser(app);
    const response = await app.inject({
      method: "POST", url: "/api/offers",
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
      payload,
    });
    expect(response.statusCode).toBe(400);
    expect(await app.prisma.offer.count()).toBe(0);
  });

});

describe("GET /api/offers/:id", () => {
  it("returns 404 for a missing offer", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const response = await app.inject({
      method: "GET",
      url: `/api/offers/${randomUUID()}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
  });

  it("returns an existing offer", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company = await createCompany(user.id);

    const offer = await createOffer(user.id, company.id);

    const response = await app.inject({
      method: "GET",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
  });

  it("returns 404 for fetching someone else's offer", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, alice);

    const company = await createCompany(bob.id);

    const offer = await createOffer(bob.id, company.id);

    const response = await app.inject({
      method: "GET",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
  });
});

describe("PATCH /api/offers/:id", () => {
  it.each([
    { label: "clear optional details", change: { skills: null, type: null, salary: null } },
    { label: "set zero salary", change: { salary: 0 } },
    { label: "preserve omitted fields", change: { title: "Updated title" } },
  ])("can $label without resetting other values", async ({ change }) => {
    const user = await createTestUser(app);
    const company = await createCompany(user.id);
    const offer = await createOffer(user.id, company.id);
    await app.prisma.offer.update({ where: { id: offer.id }, data: { salary: 40000 } });
    const before = await app.prisma.offer.findUniqueOrThrow({ where: { id: offer.id } });
    const headers = { authorization: `Bearer ${await getAuthToken(app, user)}` };
    const response = await app.inject({
      method: "PATCH", url: `/api/offers/${offer.id}`, headers, payload: change,
    });
    expect(response.statusCode).toBe(200);
    const { createdAt, updatedAt, ...unchanged } = before;
    const expected = { ...unchanged, ...change };
    const stored = await app.prisma.offer.findUniqueOrThrow({ where: { id: offer.id } });
    expect(stored).toMatchObject(expected);
    expect(stored.createdAt).toEqual(createdAt);
    const fetched = await app.inject({ method: "GET", url: `/api/offers/${offer.id}`, headers });
    expect(fetched.statusCode).toBe(200);
    // The GET contract does not expose ownership, but must include nullable details.
    const { createdBy, ...publicFields } = expected;
    expect(fetched.json()).toMatchObject(publicFields);
  });

  it("updates requested fields and preserves other fields", async () => {
    const user = await createTestUser(app);
    const token = await getAuthToken(app, user);

    const company = await createCompany(user.id);

    const offer = await createOffer(user.id, company.id);

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
      skills: "React, Node, Typescript",
    });
  });

  it("returns 404 for updating another user's offer", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, alice);

    const company = await createCompany(bob.id);

    const offer = await createOffer(bob.id, company.id);

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
    expect(await app.prisma.offer.findUnique({ where: { id: offer.id } })).toEqual(offer);
  });

  it("returns 400 for changing an offer owner", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, bob);

    const company = await createCompany(bob.id);

    const offer = await createOffer(bob.id, company.id);

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
    expect(await app.prisma.offer.findUnique({ where: { id: offer.id } })).toEqual(offer);
  });

  it("returns 404 for linking another user's company", async () => {
    const bob = await createTestUser(app);
    const alice = await createTestUser(app);
    const token = await getAuthToken(app, bob);

    const bobCompany = await createCompany(bob.id);

    const aliceCompany = await app.prisma.company.create({
      data: { name: "Furgo", location: "Paris", createdBy: alice.id },
    });

    const offer = await createOffer(bob.id, bobCompany.id);

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

    const updated = await app.prisma.offer.findUnique({
      where: { id: offer.id },
    });

    expect(updated).toMatchObject({
      title: "Fullstack dev",
      companyId: bobCompany.id,
      createdBy: bob.id,
      type: "INTERNSHIP",
      status: "APPLIED",
      skills: "React, Node",
      salary: null,
    });
    expect(response.statusCode).toBe(404);
    expect(await app.prisma.offer.findUnique({ where: { id: offer.id } })).toEqual(offer);
  });

  it("switches offer's company", async () => {
    const bob = await createTestUser(app);
    const token = await getAuthToken(app, bob);

    const bobCompany1 = await createCompany(bob.id);

    const bobCompany2 = await app.prisma.company.create({
      data: { name: "Furgo", location: "Paris", createdBy: bob.id },
    });

    const offer = await createOffer(bob.id, bobCompany1.id);

    const response = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        skills: "React, Node, Typescript",
        salary: 690,
        companyId: bobCompany2.id,
      },
    });

    expect(await app.prisma.offer.findUnique({ where: { id: offer.id } })).toMatchObject({ companyId: bobCompany2.id });
    expect(response.json()).toMatchObject({ companyId: bobCompany2.id });
    expect(response.statusCode).toBe(200);
  });

  it("returns 400 for an empty patch", async () => {
    const bob = await createTestUser(app);
    const token = await getAuthToken(app, bob);

    const bobCompany1 = await createCompany(bob.id);

    const offer = await createOffer(bob.id, bobCompany1.id);

    const response = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(await app.prisma.offer.findUnique({ where: { id: offer.id } })).toEqual(offer);
    expect(response.json().message).toContain("At least one field is required");
  });

  const invalidUpdates = [
    { label: "short title", payload: { title: "ab" } },
    { label: "unknown status", payload: { status: "INVALID" } },
    { label: "unknown type", payload: { type: "INVALID" } },
    { label: "negative salary", payload: { salary: -1 } },
    { label: "unknown field", payload: { unexpected: true } },
    { label: "salary as text", payload: { salary: "50000" } },
    { label: "fractional salary", payload: { salary: 50000.5 } },
    { label: "null status", payload: { status: null } },
    { label: "null title", payload: { title: null } },
    { label: "invalid company UUID", payload: { companyId: "invalid" } },
    { label: "null company ID", payload: { companyId: null } },
    { label: "skills as an array", payload: { skills: ["React"] } },
  ];

  it.each(invalidUpdates)("returns 400 for $label", async ({ payload }) => {
    const bob = await createTestUser(app);
    const token = await getAuthToken(app, bob);

    const bobCompany1 = await createCompany(bob.id);

    const offer = await createOffer(bob.id, bobCompany1.id);

    const before = await app.prisma.offer.findUnique({
      where: { id: offer.id },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload,
    });

    expect(response.statusCode).toBe(400);
    expect(await app.prisma.offer.findUnique({ where: { id: offer.id } })).toEqual(offer);

    const after = await app.prisma.offer.findUnique({
      where: { id: offer.id },
    });

    expect(after).toEqual(before);
  });
  it("returns 404 when updating a missing offer", async () => {
    const user = await createTestUser(app);
    const response = await app.inject({
      method: "PATCH", url: `/api/offers/${randomUUID()}`,
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
      payload: { status: "APPLIED" },
    });
    expect(response.statusCode).toBe(404);
    expect(await app.prisma.offer.count()).toBe(0);
  });

  it("rejects a nonexistent company without modifying the offer", async () => {
    const user = await createTestUser(app);
    const company = await createCompany(user.id);
    const offer = await createOffer(user.id, company.id);
    const response = await app.inject({
      method: "PATCH", url: `/api/offers/${offer.id}`,
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
      payload: { companyId: randomUUID() },
    });
    expect(response.statusCode).toBe(404);
    expect(await app.prisma.offer.findUnique({ where: { id: offer.id } })).toEqual(offer);
  });
});

describe("GET /api/offers", () => {
  it("returns only the authenticated user's offers", async () => {
    const alice = await createTestUser(app);
    const bob = await createTestUser(app);
    const company = await createCompany(alice.id);
    const otherCompany = await createCompany(bob.id);
    const first = await createOffer(alice.id, company.id);
    const second = await createOffer(alice.id, company.id);
    await createOffer(bob.id, otherCompany.id);
    const response = await app.inject({
      method: "GET", url: "/api/offers/",
      headers: { authorization: `Bearer ${await getAuthToken(app, alice)}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().map((item: { id: string }) => item.id).sort()).toEqual([first.id, second.id].sort());
  });

  it("returns an empty array when the user has no offers", async () => {
    const user = await createTestUser(app);
    const response = await app.inject({
      method: "GET", url: "/api/offers/",
      headers: { authorization: `Bearer ${await getAuthToken(app, user)}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});


// Valid request bodies ensure these cases reach the authentication hook.
describe.each([
  { method: "GET" as const, url: "/api/offers/" },
  { method: "GET" as const, url: "/api/offers/00000000-0000-4000-8000-000000000001" },
  { method: "POST" as const, url: "/api/offers" },
  { method: "PATCH" as const, url: "/api/offers/00000000-0000-4000-8000-000000000001" }
])("Authentication: $method $url", ({ method, url }) => {
  it.each(["missing", "invalid", "expired"])("rejects a %s token", async (kind) => {
    const token = kind === "expired"
      ? app.jwt.sign({ sub: randomUUID(), exp: Math.floor(Date.now() / 1000) - 60 })
      : "invalid-token";
    const headers = kind === "missing" ? {} : { authorization: `Bearer ${token}` };
    const payload = method === "POST" ? { title: "Fullstack dev", companyId: randomUUID(), type: "INTERNSHIP", status: "APPLIED", skills: "React", salary: null } : { status: "APPLIED" };
    const response = await app.inject({
      method, url, headers,
      ...(method === "GET" ? {} : { payload }),
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ message: "Unauthorized" });
  });
});
