import { z } from "zod";

const registerSchema = z
  // TODO(practice-1): Test password mismatch, boundary lengths, and invalid email.
  // Explain why backend validation is still required even with this resolver.
  .object({
    name: z.string().min(3, "Must be at least 3 characters").max(20),
    surname: z.string().min(3, "Must be at least 3 characters").max(20),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .refine(
        (val) =>
          val.length >= 8 && /[A-Z]/.test(val) && /[^A-Za-z0-9]/.test(val),
        "At least 8 characters, one uppercase letter, one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

export const userSchemas = {
  register: registerSchema,
  login: loginSchema,
};
