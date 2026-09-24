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

const companyInput = {
  name: "Acme", location: "Lyon", description: null,
  size: null, website: null, linkedin: null,
};

async function createCompany(userId: string) {
  return app.prisma.company.create({ data: { ...companyInput, createdBy: userId } });
}

async function authenticate() {
  const user = await createTestUser(app);
  const headers = { authorization: `Bearer ${await getAuthToken(app, user)}` };
  return { user, headers };
}

describe("POST /api/companies", () => {
  it("creates a company with only required fields and returns null details", async () => {
    const { user, headers } = await authenticate();
    const response = await app.inject({
      method: "POST", url: "/api/companies", headers,
      payload: { name: "Acme", location: "Lyon" },
    });
    expect(response.statusCode).toBe(201);
    const id = response.json().id;
    expect(await app.prisma.company.findUnique({ where: { id } }))
      .toMatchObject({ ...companyInput, id, createdBy: user.id });
    const fetched = await app.inject({ method: "GET", url: `/api/companies/${id}`, headers });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.json()).toMatchObject({ ...companyInput, id });
  });

  it("creates a company owned by the authenticated user", async () => {
    const { user, headers } = await authenticate();
    const response = await app.inject({
      method: "POST",
      url: "/api/companies",
      headers,
      payload: companyInput,
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ id: expect.any(String), name: "Acme", createdBy: user.id });
    expect(await app.prisma.company.findUnique({ where: { id: response.json().id } })).toMatchObject({ ...companyInput, createdBy: user.id });
  });

  it("ignores a forged owner and uses the token identity", async () => {
    const { user, headers } = await authenticate();
    const other = await createTestUser(app);
    const response = await app.inject({
      method: "POST",
      url: "/api/companies",
      headers,
      payload: { ...companyInput, createdBy: other.id },
    });
    expect(response.statusCode).toBe(201);
    expect(await app.prisma.company.findUnique({ where: { id: response.json().id } })).toMatchObject({ createdBy: user.id });
  });

  it.each([
    { label: "short name", change: { name: "ab" } },
    { label: "invalid website", change: { website: "not-a-url" } },
    { label: "negative size", change: { size: -1 } },
    { label: "fractional size", change: { size: 1.5 } },
  ])("rejects $label without creating a company", async ({ change }) => {
    const { headers } = await authenticate();
    const response = await app.inject({
      method: "POST",
      url: "/api/companies",
      headers,
      payload: { ...companyInput, ...change },
    });
    expect(response.statusCode).toBe(400);
    expect(await app.prisma.company.count()).toBe(0);
  });
});

describe("GET /api/companies", () => {
  it("returns only the authenticated user's companies", async () => {
    const { user, headers } = await authenticate();
    const other = await createTestUser(app);
    const first = await createCompany(user.id);
    const second = await createCompany(user.id);
    await createCompany(other.id);
    const response = await app.inject({
      method: "GET",
      url: "/api/companies/",
      headers,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().map((item: { id: string }) => item.id).sort()).toEqual([first.id, second.id].sort());
  });

  it("returns an empty array when the user has no companies", async () => {
    const { headers } = await authenticate();
    const response = await app.inject({
      method: "GET",
      url: "/api/companies/",
      headers,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});

describe("GET /api/companies/:id", () => {
  it("returns the user's company details", async () => {
    const { user, headers } = await authenticate();
    const company = await createCompany(user.id);
    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${company.id}`,
      headers,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ ...companyInput, id: company.id });
  });

  it("returns 404 for a missing company", async () => {
    const { headers } = await authenticate();
    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${randomUUID()}`,
      headers,
    });
    expect(response.statusCode).toBe(404);
  });

  it("returns 404 for another user's company", async () => {
    const { headers } = await authenticate();
    const other = await createTestUser(app);
    const company = await createCompany(other.id);
    const response = await app.inject({
      method: "GET",
      url: `/api/companies/${company.id}`,
      headers,
    });
    expect(response.statusCode).toBe(404);
  });
});

// Valid request bodies ensure these cases reach the authentication hook.
describe.each([
  { method: "GET" as const, url: "/api/companies/" },
  { method: "GET" as const, url: "/api/companies/00000000-0000-4000-8000-000000000001" },
  { method: "POST" as const, url: "/api/companies" }
])("Authentication: $method $url", ({ method, url }) => {
  it.each(["missing", "invalid", "expired"])("rejects a %s token", async (kind) => {
    const token = kind === "expired"
      ? app.jwt.sign({ sub: randomUUID(), exp: Math.floor(Date.now() / 1000) - 60 })
      : "invalid-token";
    const headers = kind === "missing" ? {} : { authorization: `Bearer ${token}` };
    const payload = method === "POST" ? companyInput : { status: "APPLIED" };
    const response = await app.inject({
      method, url, headers,
      ...(method === "GET" ? {} : { payload }),
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ message: "Unauthorized" });
  });
});
