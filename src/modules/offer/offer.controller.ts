import type { FastifyReply, FastifyRequest } from "fastify";
import { offerServices } from "./offer.service.js";
import type { CreateOfferInput, UpdateOfferInput } from "./offer.schema.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

async function createOfferHandler(
  request: FastifyRequest<{ Body: CreateOfferInput }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;
    const offer = request.body;

    const company = await offerServices.findCompanyByUserId(
      request.server.prisma,
      userId,
      offer.companyId,
    );

    if (!company) {
      return reply.code(404).send({
        message: "Company not found or unauthorized",
      });
    }

    const newOffer = await offerServices.createOffer(
      request.server.prisma,
      userId,
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
    const userId = request.user.sub;
    const offerId = request.params.id;
    const offer = await offerServices.findOfferById(
      request.server.prisma,
      userId,
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
    const userId = request.user.sub;
    const prisma = request.server.prisma;

    const offer = await offerServices.findOfferById(prisma, userId, offerId);

    if (!offer) {
      return reply.code(404).send({
        message: "Offer not found or unauthorized",
      });
    }

    if (body.companyId !== undefined && offer.companyId !== body.companyId) {
      const company = await offerServices.findCompanyByUserId(
        prisma,
        userId,
        body.companyId,
      );
      if (!company) {
        return reply.code(404).send({
          message: "Company not found or unauthorized",
        });
      }
    }

    const updatedOffer = await offerServices.updateOfferById(
      prisma,
      offerId,
      userId,
      body,
    );

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
