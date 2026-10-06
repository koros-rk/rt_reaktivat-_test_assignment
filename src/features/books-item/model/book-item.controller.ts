import { Book } from "../../../entities/books/schemas/book.schema";

export const useBookItemController = (book: Book, index: number) => {
  const isPlaceholder = /^placeholder-\d+$/.test(book.id.toString());
  return { isPlaceholder };
};
