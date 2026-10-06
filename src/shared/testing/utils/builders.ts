import { Book } from "../../../entities/books/schemas/book.schema";

export const buildBook = (o: Partial<Book> = {}): Book => ({
  id: "b1",
  name: "Dune",
  author: "Herbert",
  ownerId: "alice",
  ...o,
});
