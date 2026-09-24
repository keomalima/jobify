import type { FastifyInstance } from "fastify";
import { companySchemas } from "./company.schema.js";
import { companyController } from "./company.controller.js";
import z from "zod";

export async function companyRoutes(server: FastifyInstance) {
  server.get("/:id", {
    schema: {
      params: z.object({ id: z.uuid() }),
      response: { 200: companySchemas.response.getCompany },
      description: "Get the company and information by id",
    },
    handler: companyController.getCompanyHandler,
  });

  server.get("/", {
    schema: {
      response: { 200: companySchemas.response.getCompanies },
      description: "Get the companies list by user",
    },
    handler: companyController.getCompaniesHandler,
  });

  server.post("/", {
    schema: {
      body: companySchemas.request.createCompany,
      response: { 201: companySchemas.response.createCompany },
      description: "Add a new company",
    },
    handler: companyController.createCompanyHandler,
  });

  server.patch("/:id", {
    schema: {
      params: z.object({ id: z.uuid() }),
      body: companySchemas.request.updateCompany,
      response: { 200: companySchemas.response.updateCompany },
      description: "Update an offer",
    },
    handler: companyController.updateCompanyHandler,
  });
}
