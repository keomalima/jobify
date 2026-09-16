import type { FastifyInstance } from "fastify";
import { companySchemas } from "./company.schema.js";
import { companyController } from "./company.controller.js";

export async function companyRoutes(server: FastifyInstance) {
  server.post("/", {
    schema: {
      body: companySchemas.request.createCompany,
      response: { 201: companySchemas.request.createCompany },
      description: "Add a new company",
    },
    handler: companyController.createCompanyHandler,
  });
}
