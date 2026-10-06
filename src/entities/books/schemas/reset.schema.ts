import { z } from "zod";

export const ResetBooksRequestSchema = z.object({
  user: z.string(),
});

export const ResetBooksResponseSchema = z.object({
  status: z.string(),
});

export type ResetBooksRequest = z.output<typeof ResetBooksRequestSchema>;
export type ResetBooksResponse = z.output<typeof ResetBooksResponseSchema>;
