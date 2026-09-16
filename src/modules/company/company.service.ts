import type { PrismaClient } from "@prisma/client/extension";
import type { CreateCompanyInput } from "./company.schema.js";

async function createCompany(
  prisma: PrismaClient,
  company: CreateCompanyInput,
) {
  return prisma.company.create({ data: company });
}

export const companyServices = {
  createCompany,
};
