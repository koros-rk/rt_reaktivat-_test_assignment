import { GetBooksQuery } from "../../../entities/books/queries/get.query";
import { Book } from "../../../entities/books/schemas/book.schema";
import { queryClient } from "../../api/query-client";

export const booksKey = (user: string, isPrivate: boolean) =>
  GetBooksQuery({ user, isPrivate }).queryKey;

export const seedBooks = (user: string, all: Book[], priv: Book[]) => {
  queryClient.setQueryData(booksKey(user, false), all);
  queryClient.setQueryData(booksKey(user, true), priv);
};

export const readBooks = (user: string, isPrivate: boolean) =>
  queryClient.getQueryData<Book[]>(booksKey(user, isPrivate));
