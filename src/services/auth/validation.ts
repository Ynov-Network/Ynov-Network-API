import { z } from "zod/v4";

export const signInSchema = z.strictObject({
  university_email: z.email(),
  password: z.string().min(8, "At least 8 characters").max(64, "Password cannot exceed 64 characters"),
});

export const signUpSchema = z.strictObject({
  first_name: z.string().min(3, "Must be at least 3 characters").max(50),
  last_name: z.string().min(3, "Must be at least 3 characters").max(50),
  username: z.string().min(3, "Must be at least 3 characters").max(20),
  university_email: z.email("Must be a valid email address")
    .includes("ynov.com", {
      message: "Email must be a Ynov email (ynov.com)",
    }),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[a-z]/, "At least 1 lowercase letter")
    .regex(/[A-Z]/, "At least 1 uppercase letter")
    .regex(/[0-9]/, "At least 1 number")
    .regex(/[@$!%*?&#]/, "At least 1 special character (@$!%*?&#)")
    .max(64, "Password cannot exceed 64 characters"),
});

export type SignInRequestBody = z.infer<typeof signInSchema>;
export type SignUpRequestBody = z.infer<typeof signUpSchema>;