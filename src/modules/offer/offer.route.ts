import type { FastifyInstance } from "fastify";
import { offerController } from "./offer.controller.js";
import { offerSchemas } from "./offer.schema.js";
import z from "zod";

export async function offerRoutes(server: FastifyInstance) {
  server.get("/:id", {
    schema: {
      params: z.object({ id: z.string() }),
      response: { 200: offerSchemas.response.getOffer },
      description: "Get the offer information by id",
    },
    handler: offerController.getOfferHandler,
  });

  server.get("/", {
    schema: {
      response: { 200: offerSchemas.response.getOffers },
      description: "Get the offers list by user",
    },
    handler: offerController.getOffersHandler,
  });

  server.post("/", {
    schema: {
      body: offerSchemas.request.createOffer,
      response: { 201: offerSchemas.response.createOffer },
      description: "Add a new offer",
    },
    handler: offerController.createOfferHandler,
  });

  server.patch("/:id", {
    schema: {
      params: z.object({ id: z.string() }),
      body: offerSchemas.request.updateOffer,
      response: { 200: offerSchemas.response.updateOffer },
      description: "Update an offer",
    },
    handler: offerController.updateOfferHandler,
  });
}
