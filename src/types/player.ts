import z from "zod";

export const signInSchema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });
  
  export type SignInInput = z.infer<typeof signInSchema>;