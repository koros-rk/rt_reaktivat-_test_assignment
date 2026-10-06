import { z } from "zod";
import { BookSchema } from "./book.schema";

export const CreateBookRequestSchema = z.object({
  user: z.string(),
  book: BookSchema,
});

export const CreateBookResponseSchema = z.object({
  status: z.string(),
});

export type CreateBookRequest = z.output<typeof CreateBookRequestSchema>;
export type CreateBookResponse = z.output<typeof CreateBookResponseSchema>;
