import { z } from "zod";

export const BookSchema = z.intersection(
  z.record(z.string(), z.unknown()),
  z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    ownerId: z.string(),
    author: z.string(),
  }),
);

export type Book = z.output<typeof BookSchema>;
