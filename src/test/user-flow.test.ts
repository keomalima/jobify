import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { resetTestDatabase } from "./helpers.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

beforeEach(async () => {
  await resetTestDatabase(app);
});

afterAll(async () => {
  await app?.close();
});

describe("Job tracking workflow", () => {
  it("registers, logs in, creates a company and offer, and reads back an update", async () => {
    const credentials = {
      email: "workflow@test.com",
      password: "Password123*",
    };

    const registration = await app.inject({
      method: "POST",
      url: "/api/register",
      payload: { name: "Alice", surname: "Martin", ...credentials },
    });
    expect(registration.statusCode).toBe(201);
    const user = registration.json();
    expect(user.id).toEqual(expect.any(String));
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("salt");

    // Use the real login token throughout, rather than signing one in a helper.
    const login = await app.inject({
      method: "POST",
      url: "/api/login",
      payload: credentials,
    });
    expect(login.statusCode).toBe(200);
    const session = login.json();
    expect(session.token).toEqual(expect.any(String));
    expect(session.id).toBe(user.id);
    expect(session).not.toHaveProperty("password");
    expect(session).not.toHaveProperty("salt");
    const headers = { authorization: `Bearer ${session.token}` };

    const companyInput = {
      name: "Acme",
      location: "Lyon",
      description: null,
      size: null,
      website: null,
      linkedin: null,
    };
    const companyResponse = await app.inject({
      method: "POST",
      url: "/api/companies",
      headers,
      payload: companyInput,
    });
    expect(companyResponse.statusCode).toBe(201);
    const company = companyResponse.json();
    expect(company).toMatchObject({
      id: expect.any(String),
      name: companyInput.name,
      createdBy: user.id,
    });

    const offerInput = {
      title: "Junior fullstack developer",
      companyId: company.id,
      type: "FULL_TIME",
      status: "WISHLIST",
      skills: "TypeScript, React",
      salary: null,
    };
    const offerResponse = await app.inject({
      method: "POST",
      url: "/api/offers",
      headers,
      payload: offerInput,
    });
    expect(offerResponse.statusCode).toBe(201);
    const offer = offerResponse.json();
    expect(offer).toMatchObject({
      id: expect.any(String),
      title: offerInput.title,
      createdBy: user.id,
    });

    const changes = { status: "APPLIED", salary: 40000 };
    const expectedOffer = { ...offerInput, ...changes, id: offer.id };
    const update = await app.inject({
      method: "PATCH",
      url: `/api/offers/${offer.id}`,
      headers,
      payload: changes,
    });
    expect(update.statusCode).toBe(200);
    expect(update.json()).toMatchObject(expectedOffer);

    // A separate request confirms the change was persisted.
    const fetchedOffer = await app.inject({
      method: "GET",
      url: `/api/offers/${offer.id}`,
      headers,
    });
    expect(fetchedOffer.statusCode).toBe(200);
    expect(fetchedOffer.json()).toMatchObject(expectedOffer);

    const offers = await app.inject({
      method: "GET",
      url: "/api/offers/",
      headers,
    });
    expect(offers.statusCode).toBe(200);
    expect(offers.json()).toEqual([expect.objectContaining(expectedOffer)]);

    const companies = await app.inject({
      method: "GET",
      url: "/api/companies/",
      headers,
    });
    expect(companies.statusCode).toBe(200);
    expect(companies.json()).toEqual([
      expect.objectContaining({ ...companyInput, id: company.id }),
    ]);
  });
});
