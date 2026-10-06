import { Book } from "../../../entities/books/schemas/book.schema";

export const getPlaceholderBooks = (): Book[] =>
  Array.from({ length: 20 }).map((_, i) => ({
    id: `placeholder-${i}`,
    name: "placeholder",
    author: "placeholder",
    ownerId: "placeholder",
  }));

export const PLACEHOLDER_BOOKS = getPlaceholderBooks();
