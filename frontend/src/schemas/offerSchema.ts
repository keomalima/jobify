import z from "zod";

export const OFFER_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "APPRENTICESHIP",
  "CONTRACT",
] as const;

export const OFFER_STATUSES = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEWING",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "GHOSTED",
  "WITHDRAWN",
] as const;

export const TYPE_LABELS: Record<(typeof OFFER_TYPES)[number], string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  APPRENTICESHIP: "Apprenticeship",
  CONTRACT: "Contract",
};

export const STATUS_LABELS: Record<(typeof OFFER_STATUSES)[number], string> = {
  WISHLIST: "Saved", APPLIED: "Applied", SCREENING: "Screening",
  INTERVIEWING: "Interview", OFFER: "Offer", ACCEPTED: "Accepted",
  REJECTED: "Rejected", GHOSTED: "Ghosted", WITHDRAWN: "Withdrawn",
};

const salaryString = z
  .string()
  .optional()
  .refine(
    (val) => !val || (/^\d+$/.test(val) && Number.isSafeInteger(Number(val)) && Number(val) >= 0),
    "Enter a whole number of zero or more",
  );

// TODO(practice-1): Test conditional company validation, blank optional fields,
// invalid URLs, and salary values (empty, zero, negative, decimal). Match the API contract.
export const offerFormSchema = z
  .object({
    companyMode: z.enum(["existing", "new"]),
    companyId: z.string().optional(),
    companyName: z.string().optional(),
    companyLocation: z.string().optional(),
    companyWebsite: z.string().optional(),

    title: z.string().trim().min(3, "Title is required"),
    type: z.union([z.literal(""), z.enum(OFFER_TYPES)]).optional(),
    status: z.enum(OFFER_STATUSES),
    skills: z.string().optional(),
    salary: salaryString,
  })
  .superRefine((data, ctx) => {
    if (data.companyMode === "existing" && !data.companyId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a company",
        path: ["companyId"],
      });
    }
    if (data.companyMode === "new") {
      if (data.companyWebsite && !z.string().url().safeParse(data.companyWebsite).success) {
        ctx.addIssue({ code: "custom", message: "Enter a valid URL", path: ["companyWebsite"] });
      }
      if (!data.companyName || data.companyName.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: "At least 3 characters",
          path: ["companyName"],
        });
      }
      if (!data.companyLocation || data.companyLocation.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: "At least 3 characters",
          path: ["companyLocation"],
        });
      }
    }
  });

export type OfferFormValues = z.infer<typeof offerFormSchema>;
