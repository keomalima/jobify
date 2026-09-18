import type { FastifyReply, FastifyRequest } from "fastify";
import { offerServices } from "./offer.service.js";
import type { CreateOfferInput, UpdateOfferInput } from "./offer.schema.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string }; // what you pass to jwt.sign
    user: { id: string }; // what request.user is after jwtVerify
  }
}

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

async function updateOfferHandler(
  request: FastifyRequest<{ Body: UpdateOfferInput; Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const offerId = request.params.id;
    const body = request.body;
    const userId = request.user.id;

    const updatedOffer = await offerServices.updateOfferById(
      request.server.prisma,
      offerId,
      userId,
      body,
    );

    if (!updatedOffer) {
      return reply.code(404).send({
        message: "Offer not found or unauthorized",
      });
    }

    return updatedOffer;
  } catch (error) {
    reply.code(500).send({ message: "Failed to update the offer" });
  }
}

export const offerController = {
  createOfferHandler,
  getOfferHandler,
  updateOfferHandler,
};
