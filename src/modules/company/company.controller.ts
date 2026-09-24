import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "./company.schema.js";
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
    request.log.error(error);
    return reply.code(500).send({ message: "Failed to create company" });
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
        message: "Company not found or unauthorized",
      });
    }

    return company;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Failed to fetch company" });
  }
}

async function getCompaniesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;

    return await companyServices.findCompaniesByUserId(
      request.server.prisma,
      userId,
    );
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Failed to fetch company" });
  }
}

async function updateCompanyHandler(
  request: FastifyRequest<{ Body: UpdateCompanyInput; Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const companyId = request.params.id;
    const body = request.body;
    const userId = request.user.sub;
    const prisma = request.server.prisma;

    const company = await companyServices.findCompanyById(
      prisma,
      userId,
      companyId,
    );

    if (!company) {
      return reply.code(404).send({
        message: "Company not found or unauthorized",
      });
    }

    return await companyServices.updateCompanyById(
      prisma,
      companyId,
      userId,
      body,
    );
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Failed to update the company" });
  }
}

export const companyController = {
  getCompanyHandler,
  createCompanyHandler,
  getCompaniesHandler,
  updateCompanyHandler,
};
