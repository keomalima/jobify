import z from "zod";

// =====================
// Request Schemas
// =====================

const passwordSchema = () =>
  z
    .string()
    .refine(
      (val) => val.length >= 8 && /[A-Z]/.test(val) && /[^A-Za-z0-9]/.test(val),
      {
        message:
          "Password must be at least 8 characters, include an uppercase letter and a special character.",
      },
    );

const createUserSchema = z.object({
  email: z.email(),
  password: passwordSchema(),
  surname: z
    .string()
    .min(3, "Your surname must be at least 3 characters long")
    .max(20),
  name: z
    .string()
    .min(3, "Your surname must be at least 3 characters long")
    .max(20),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

// =====================
// Response Schemas
// =====================

const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().min(3),
  token: z.string(),
});

const loginResponseSchema = z.object({
  id: z.string(),
  token: z.string(),
});

const getUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().min(3),
  surname: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// =====================
// Type Exports
// =====================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// =====================
// Schema Objects Export
// =====================

export const userSchemas = {
  // Request schemas
  request: {
    createUser: createUserSchema,
    login: loginSchema,
  },

  // Response schemas
  response: {
    createUser: createUserResponseSchema,
    login: loginResponseSchema,
    getUser: getUserResponseSchema,
  },
};
