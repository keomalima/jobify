import type { PrismaClient } from "@prisma/client/extension";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "./company.schema.js";

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

async function findCompaniesByUserId(prisma: PrismaClient, userId: string) {
  return prisma.company.findMany({
    where: {
      createdBy: userId,
    },
  });
}

async function updateCompanyById(
  prisma: PrismaClient,
  companyId: string,
  userId: string,
  body: UpdateCompanyInput,
) {
  return prisma.company.update({
    where: {
      id: companyId,
      createdBy: userId,
    },
    data: body,
  });
}

export const companyServices = {
  createCompany,
  findCompanyById,
  findCompaniesByUserId,
  updateCompanyById,
};
