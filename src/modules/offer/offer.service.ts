import type { PrismaClient } from "@prisma/client";
import type { CreateOfferInput, UpdateOfferInput } from "./offer.schema.js";

async function createOffer(
  prisma: PrismaClient,
  userId: string,
  offer: CreateOfferInput,
) {
  return prisma.offer.create({ data: { ...offer, createdBy: userId } });
}

async function findCompanyByUserId(
  prisma: PrismaClient,
  userId: string,
  companyId: string,
) {
  return prisma.company.findUnique({
    where: {
      id: companyId,
      createdBy: userId,
    },
  });
}

async function findOfferById(
  prisma: PrismaClient,
  userId: string,
  offerId: string,
) {
  return prisma.offer.findUnique({
    where: { id: offerId, createdBy: userId },
  });
}

async function updateOfferById(
  prisma: PrismaClient,
  offerId: string,
  userId: string,
  body: UpdateOfferInput,
) {
  return prisma.offer.update({
    where: {
      id: offerId,
      createdBy: userId,
    },
    data: body,
  });
}

export const offerServices = {
  createOffer,
  findOfferById,
  updateOfferById,
  findCompanyByUserId,
};
