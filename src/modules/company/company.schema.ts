// =====================
// Request Schemas
// =====================

import z from "zod";

const createCompanyRequestSchema = z.object({
  name: z.string().min(3, "A company name is requested"),
  location: z.string().min(3, "A company location is requested"),
  description: z.string().nullable().exactOptional(),
  size: z.number().int().positive().nullable().exactOptional(),
  website: z.url().nullable().exactOptional(),
  linkedin: z.url().nullable().exactOptional(),
});

const updateCompanyRequestSchema = createCompanyRequestSchema
  .exactPartial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field is required",
  });

// =====================
// Response Schemas
// =====================

const createCompanyResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  createdBy: z.string(),
});

const getCompanyResponseSchema = createCompanyRequestSchema.extend({
  id: z.uuid(),
});

const getCompaniesResponseSchema = z.array(getCompanyResponseSchema);

// =====================
// Type Exports
// =====================

export type CreateCompanyInput = z.infer<typeof createCompanyRequestSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanyRequestSchema>;

// =====================
// Schema Objects Export
// =====================

export const companySchemas = {
  request: {
    createCompany: createCompanyRequestSchema,
    updateCompany: updateCompanyRequestSchema,
  },

  response: {
    createCompany: createCompanyResponseSchema,
    getCompany: getCompanyResponseSchema,
    getCompanies: getCompaniesResponseSchema,
    updateCompany: getCompanyResponseSchema,
  },
};
