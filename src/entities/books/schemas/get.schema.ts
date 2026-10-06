import { z } from "zod";
import { BookSchema } from "./book.schema";

export const GetBooksRequestSchema = z.object({
  user: z.string(),
  isPrivate: z.boolean(),
});

export const GetBooksResponseSchema = z.array(BookSchema);

export type GetBooksRequest = z.output<typeof GetBooksRequestSchema>;
export type GetBooksResponse = z.output<typeof GetBooksResponseSchema>;
