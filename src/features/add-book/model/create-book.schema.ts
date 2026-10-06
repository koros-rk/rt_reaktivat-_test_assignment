import { z } from "zod";

export const CreateBookSchema = z
  .object({
    user: z.string(),
    book: z.object({
      id: z.string(),
      name: z.string().nonempty(),
      author: z.string().nonempty(),
      fields: z.array(
        z.object({
          id: z.string(),
          name: z.string().nonempty(),
          value: z.string().nonempty(),
        }),
      ),
    }),
  })
  .superRefine(({ book }, context) => {
    const firstIndexByName = new Map<string, number>();

    book.fields.forEach((field, index) => {
      if (firstIndexByName.has(field.name)) {
        context.addIssue({
          code: "custom",
          message: "duplicate",
          path: ["book", "fields", index, "name"],
        });
        return;
      }

      firstIndexByName.set(field.name, index);
    });
  });

export type CreateBook = z.output<typeof CreateBookSchema>;
export type CreateBookFields = z.output<
  typeof CreateBookSchema
>["book"]["fields"];
