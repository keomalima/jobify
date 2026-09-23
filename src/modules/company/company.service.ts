import type { PrismaClient } from "@prisma/client/extension";
import type { CreateCompanyInput } from "./company.schema.js";

async function createCompany(
  prisma: PrismaClient,
  userId: string,
  company: CreateCompanyInput,
) {
  return prisma.company.create({ data: { ...company, createdBy: userId } });
}

async function findCompanyById(
  prisma: PrismaClient,
  userId: string,
  companyId: string,
) {
  return prisma.company.findUnique({
    where: { id: companyId, createdBy: userId },
  });
}

export const companyServices = {
  createCompany,
  findCompanyById,
};
