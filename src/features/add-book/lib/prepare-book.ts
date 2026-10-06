import { CreateBookRequest } from "../../../entities/books/schemas/create.schema";
import { CreateBook } from "../model/create-book.schema";

export const prepareBook = (
  book: CreateBook["book"],
  user: string,
): CreateBookRequest["book"] => {
  const normalizeName = (name: string) => name.trim().toLowerCase();

  const fields = book.fields.reduce((acc, field) => {
    return { ...acc, [normalizeName(field.name)]: field.value };
  }, {});

  return {
    ...fields,

    id: book.id,
    name: book.name,
    author: book.author,
    ownerId: user,
  };
};
