import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateCompanyInput } from "./company.schema.js";
import { companyServices } from "./company.service.js";

async function createCompanyHandler(
  request: FastifyRequest<{ Body: CreateCompanyInput }>,
  reply: FastifyReply,
) {
  try {
    const company = request.body;

    const newCompany = await companyServices.createCompany(
      request.server.prisma,
      company,
    );

    return reply.code(201).send(newCompany);
  } catch (error) {
    reply.code(500).send({ message: "Failed to create company" });
  }
}

export const companyController = {
  createCompanyHandler,
};
