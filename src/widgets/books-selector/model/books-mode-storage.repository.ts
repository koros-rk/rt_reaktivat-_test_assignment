import { create } from "zustand/react";
import {
  BookListMode,
  BookListStorageInterface,
} from "./books-mode-storage.interface";

export const BookListStorage = create<BookListStorageInterface>()((set) => ({
  mode: BookListMode.all,
  setMode: (mode) => set({ mode }),
}));

export const useBookListStorage = BookListStorage;
