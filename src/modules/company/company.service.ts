import type { PrismaClient } from "@prisma/client/extension";
import type { CreateCompanyInput } from "./company.schema.js";

async function createCompany(
  prisma: PrismaClient,
  company: CreateCompanyInput,
) {
  return prisma.company.create({ data: company });
}

async function findCompanyById(prisma: PrismaClient, companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
  });
}

export const companyServices = {
  createCompany,
  findCompanyById,
};
