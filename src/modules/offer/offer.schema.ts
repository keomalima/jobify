import { z } from "zod";
import { OfferType, OfferStatus } from "@prisma/client";

// =====================
// Request Schemas
// =====================

const createOfferRequestSchema = z.object({
  title: z.string().min(3, "Title is required"),
  companyId: z.uuid(),
  type: z.enum(OfferType),
  status: z.enum(OfferStatus),
  skills: z.string(),
  salary: z.number().int().nonnegative().nullable(),
});

const updateOfferRequestSchema = createOfferRequestSchema
  .exactPartial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field is required",
  });

// =====================
// Response Schemas
// =====================

const createOfferResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
});

const getOfferResponseSchema = createOfferRequestSchema.extend({
  id: z.uuid(),
});

const getOffersResponseSchema = z.array(getOfferResponseSchema);
// =====================
// Type Exports
// =====================

export type CreateOfferInput = z.infer<typeof createOfferRequestSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferRequestSchema>;

// =====================
// Schema Objects Export
// =====================

export const offerSchemas = {
  request: {
    createOffer: createOfferRequestSchema,
    updateOffer: updateOfferRequestSchema,
  },

  response: {
    createOffer: createOfferResponseSchema,
    getOffer: getOfferResponseSchema,
    updateOffer: getOfferResponseSchema,
    getOffers: getOffersResponseSchema,
  },
};
