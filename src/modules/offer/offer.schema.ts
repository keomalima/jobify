import { z } from "zod";
import { OfferType, OfferStatus } from "@prisma/client";

// =====================
// Request Schemas
// =====================

const createOfferRequestSchema = z.object({
  title: z.string().min(3, "Title is required"),
  companyId: z.string(),
  type: z.enum(OfferType),
  status: z.enum(OfferStatus),
  skills: z.string(),
  salary: z.number().int().nullable(),
});

// =====================
// Response Schemas
// =====================

const createOfferResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.date(),
});

const getOfferResponseSchema = z.object({
  id: z.string(),
  company: z.string(),
  status: z.string(),
});

// =====================
// Type Exports
// =====================

export type CreateOfferInput = z.infer<typeof createOfferRequestSchema>;

// =====================
// Schema Objects Export
// =====================

export const offerSchemas = {
  request: {
    createOffer: createOfferRequestSchema,
  },

  response: {
    createOffer: createOfferResponseSchema,
    getOffer: getOfferResponseSchema,
  },
};
