import { z } from "zod";

const registerSchema = z
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

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const userSchemas = {
  register: registerSchema,
};
