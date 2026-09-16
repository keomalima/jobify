import type { FastifyReply, FastifyRequest } from "fastify";
import { offerServices } from "./offer.service.js";
import type { CreateOfferInput } from "./offer.schema.js";

async function createOfferHandler(
  request: FastifyRequest<{ Body: CreateOfferInput }>,
  reply: FastifyReply,
) {
  try {
    const offer = request.body;

    const newOffer = await offerServices.createOffer(
      request.server.prisma,
      offer,
    );

    return reply.code(201).send(newOffer);
  } catch (error: any) {
    reply.code(500).send({ message: "Failed to create offer" });
  }
}

async function getOfferHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const offerId = request.params.id;
    const offer = await offerServices.findOfferById(
      request.server.prisma,
      offerId,
    );

    if (!offer) {
      return reply.code(404).send({
        message: "Offer not found or unauthorized",
      });
    }
    return offer;
  } catch (error) {
    reply.code(500).send({ message: "Failed to fetch offer" });
  }
}

export const offerController = {
  createOfferHandler,
  getOfferHandler,
};
