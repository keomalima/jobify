import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateCompanyInput } from "./company.schema.js";
import { companyServices } from "./company.service.js";

async function createCompanyHandler(
  request: FastifyRequest<{ Body: CreateCompanyInput }>,
  reply: FastifyReply,
) {
  try {
    const company = request.body;
    const userId = request.user.sub;

    const newCompany = await companyServices.createCompany(
      request.server.prisma,
      userId,
      company,
    );

    return reply.code(201).send(newCompany);
  } catch (error) {
    reply.code(500).send({ message: "Failed to create company" });
  }
}

async function getCompanyHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;
    const companyId = request.params.id;

    const company = await companyServices.findCompanyById(
      request.server.prisma,
      userId,
      companyId,
    );

    if (!company) {
      return reply.code(404).send({
        message: "Offer not found or unauthorized",
      });
    }

    return company;
  } catch (error) {
    reply.code(500).send({ message: "Failed to fetch company" });
  }
}

export const companyController = {
  getCompanyHandler,
  createCompanyHandler,
};
