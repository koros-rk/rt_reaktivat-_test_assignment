import { useState } from "react";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { getShortId } from "../lib/get-short-id";
import { CreateBook } from "./create-book.schema";

export const InitialCreateBookState: CreateBook = {
  user: "",
  book: {
    id: "",
    name: "",
    author: "",
    fields: [],
  },
};

export const createInitialCreateBookState = (): CreateBook => ({
  user: UserStorage.getState().user || "",
  book: { ...InitialCreateBookState.book, id: getShortId(), fields: [] },
});

export const getInitialCreateBookState = () => {
  const [state] = useState(createInitialCreateBookState);

  return state;
};
