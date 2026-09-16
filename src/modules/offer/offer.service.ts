import type { PrismaClient } from "@prisma/client";
import type { CreateOfferInput } from "./offer.schema.js";

async function createOffer(prisma: PrismaClient, offer: CreateOfferInput) {
  return prisma.offer.create({ data: offer });
}

async function findOfferById(prisma: PrismaClient, offerId: string) {
  return prisma.offer.findUnique({
    where: { id: offerId },
  });
}

export const offerServices = {
  createOffer,
  findOfferById,
};
