import type { PrismaClient } from "@prisma/client";
import type { CreateOfferInput, UpdateOfferInput } from "./offer.schema.js";

async function createOffer(prisma: PrismaClient, offer: CreateOfferInput) {
  return prisma.offer.create({ data: offer });
}

async function findOfferById(prisma: PrismaClient, offerId: string) {
  return prisma.offer.findUnique({
    where: { id: offerId },
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
    data: body ,
  });
}

export const offerServices = {
  createOffer,
  findOfferById,
  updateOfferById,
};
