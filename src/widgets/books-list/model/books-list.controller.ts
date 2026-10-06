import { useQuery } from "@tanstack/react-query";
import { GetBooksQuery } from "../../../entities/books/queries/get.query";
import { useRequiredUserStorage } from "../../../entities/user/storage/user-storage.repository";
import { useBookListStorage } from "../../books-selector/model/books-mode-storage.repository";
import { PLACEHOLDER_BOOKS } from "../lib/get-placeholder-books";

export const useBooksListController = () => {
  const mode = useBookListStorage((state) => state.mode);
  const { user } = useRequiredUserStorage();

  const { data, status } = useQuery({
    ...GetBooksQuery({ user, isPrivate: mode === "private" }),
    placeholderData: PLACEHOLDER_BOOKS,
  });

  return { books: data ?? [], status };
};
