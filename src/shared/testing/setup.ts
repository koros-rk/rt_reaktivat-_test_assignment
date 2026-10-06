import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { UserStorage } from "../../entities/user/storage/user-storage.repository";
import { BookListMode } from "../../widgets/books-selector/model/books-mode-storage.interface";
import { BookListStorage } from "../../widgets/books-selector/model/books-mode-storage.repository";
import { queryClient } from "../api/query-client";
import "../lib/i18n/i18n.instance";

vi.mock("../api/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

vi.mock("notistack", () => ({
  enqueueSnackbar: vi.fn(),
  SnackbarProvider: ({ children }: any) => children,
}));

beforeEach(() => {
  queryClient.setDefaultOptions({
    queries: { retry: false, gcTime: Infinity },
    mutations: { retry: false },
  });
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  localStorage.clear();
  UserStorage.setState({ user: null });
  BookListStorage.setState({ mode: BookListMode.all });
});
