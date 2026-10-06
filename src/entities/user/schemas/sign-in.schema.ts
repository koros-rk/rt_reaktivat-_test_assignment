import { z } from "zod";

export const SignInSchema = z.object({ user: z.string().trim().min(1) });

export type SignIn = z.output<typeof SignInSchema>;
