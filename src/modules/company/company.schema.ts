// =====================
// Request Schemas
// =====================

import z from "zod";

const createCompanyRequestSchema = z.object({
  name: z.string().min(3, "A company name is requested"),
  location: z.string().min(3, "A company location is requested"),
  description: z.string().nullable(),
  size: z.number().int().positive().nullable(),
  website: z.url().nullable(),
  linkedin: z.url().nullable(),
});

// =====================
// Response Schemas
// =====================

const createCompanyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdBy: z.string(),
});

const getCompanyResponseSchema = createCompanyRequestSchema.extend({
  id: z.string(),
});

const getCompaniesResponseSchema = z.array(getCompanyResponseSchema);

// =====================
// Type Exports
// =====================

export type CreateCompanyInput = z.infer<typeof createCompanyRequestSchema>;

// =====================
// Schema Objects Export
// =====================

export const companySchemas = {
  request: {
    createCompany: createCompanyRequestSchema,
  },

  response: {
    createCompany: createCompanyResponseSchema,
    getCompany: getCompanyResponseSchema,
    getCompanies: getCompaniesResponseSchema,
  },
};
