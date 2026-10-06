import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Book } from "../../../entities/books/schemas/book.schema";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { queryClient } from "../../../shared/api/query-client";
import { api } from "../../../shared/testing/utils/api";
import { buildBook } from "../../../shared/testing/utils/builders";
import { deferred } from "../../../shared/testing/utils/deferred";
import { makeAxiosError } from "../../../shared/testing/utils/make-axios-error";
import { renderControllerWithBoundary } from "../../../shared/testing/utils/render-with-error-boundary";
import {
  renderController,
  signIn,
} from "../../../shared/testing/utils/test-utils";
import { BookListMode } from "../../books-selector/model/books-mode-storage.interface";
import { BookListStorage } from "../../books-selector/model/books-mode-storage.repository";
import { useBooksListController } from "../model/books-list.controller";

const PLACEHOLDER_COUNT = 20;

const setup = () => {
  signIn("alice");
  return renderController(() => useBooksListController());
};

describe("useBooksListController", () => {
  describe("without user", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("nobody is signed in → throws", () => {
      const { onError } = renderControllerWithBoundary(() =>
        useBooksListController(),
      );

      expect(onError).toHaveBeenCalledOnce();
      expect(onError.mock.calls[0][0].message).toMatch(/authenticated screen/);
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe("loading", () => {
    it('request is pending → placeholders with status "success"', () => {
      api.get.mockReturnValue(deferred().promise);

      const { result } = setup();

      expect(result.current.books).toHaveLength(PLACEHOLDER_COUNT);
      expect(
        result.current.books.every((b) =>
          String(b.id).startsWith("placeholder-"),
        ),
      ).toBe(true);
      expect(result.current.books[0].id).toBe("placeholder-0");
      expect(result.current.status).toBe("success");
    });

    it("response arrives → books are API data, no placeholders left", async () => {
      const d = deferred<{ data: Book[] }>();
      api.get.mockReturnValue(d.promise);
      const { result } = setup();
      expect(result.current.books).toHaveLength(PLACEHOLDER_COUNT);

      d.resolve({ data: [buildBook({ id: "r1" })] });

      await waitFor(() =>
        expect(result.current.books.map((b) => b.id)).toEqual(["r1"]),
      );
      expect(result.current.status).toBe("success");
    });

    it("placeholder array is referentially stable between renders", () => {
      api.get.mockReturnValue(deferred().promise);
      const { result, rerender } = setup();
      const first = result.current.books;

      rerender();

      expect(result.current.books).toBe(first);
    });
  });

  describe("mode", () => {
    it.each([
      [BookListMode.all, "/books/alice"],
      [BookListMode.private, "/books/alice/private"],
    ])("mode=%s → GET %s", async (mode, url) => {
      BookListStorage.setState({ mode });
      api.get.mockResolvedValue({ data: [] });

      setup();

      await waitFor(() => expect(api.get).toHaveBeenCalledWith(url));
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it("requests the private endpoint when the mode is switched to private", async () => {
      api.get.mockResolvedValue({ data: [] });
      setup();
      await waitFor(() => expect(api.get).toHaveBeenCalledWith("/books/alice"));

      act(() => BookListStorage.getState().setMode(BookListMode.private));

      await waitFor(() =>
        expect(api.get).toHaveBeenCalledWith("/books/alice/private"),
      );
    });

    it("mode changes while running → new request and placeholders again", async () => {
      api.get.mockResolvedValueOnce({ data: [buildBook({ id: "pub" })] });
      const { result } = setup();
      await waitFor(() =>
        expect(result.current.books.map((b) => b.id)).toEqual(["pub"]),
      );

      const d = deferred<{ data: Book[] }>();
      api.get.mockReturnValueOnce(d.promise);
      act(() => BookListStorage.getState().setMode(BookListMode.private));

      await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
      expect(result.current.books).toHaveLength(PLACEHOLDER_COUNT);

      d.resolve({ data: [buildBook({ id: "prv" })] });
      await waitFor(() =>
        expect(result.current.books.map((b) => b.id)).toEqual(["prv"]),
      );
    });
  });

  describe("result states", () => {
    it('API error → status "error" and empty books', async () => {
      api.get.mockRejectedValue(makeAxiosError({ status: 500 }));

      const { result } = setup();

      await waitFor(() => expect(result.current.status).toBe("error"));
      expect(result.current.books).toEqual([]);
    });

    it('empty response → books [] and status "success" (no separate empty state)', async () => {
      const d = deferred<{ data: Book[] }>();
      api.get.mockReturnValue(d.promise);
      const { result } = setup();

      d.resolve({ data: [] });

      await waitFor(() => expect(result.current.books).toEqual([]));
      expect(result.current.status).toBe("success");
    });

    it('response violating the schema → status "error" and empty books', async () => {
      api.get.mockResolvedValue({ data: { nope: true } });

      const { result } = setup();

      await waitFor(() => expect(result.current.status).toBe("error"));
      expect(result.current.books).toEqual([]);
    });
  });

  describe("cache", () => {
    it('data is stored under ["books", { user, isPrivate }]', async () => {
      const books = [buildBook({ id: "c1" })];
      api.get.mockResolvedValue({ data: books });
      const { result } = setup();

      await waitFor(() =>
        expect(result.current.books.map((b) => b.id)).toEqual(["c1"]),
      );

      expect(
        queryClient.getQueryData([
          "books",
          { user: "alice", isPrivate: false },
        ]),
      ).toEqual(books);
      expect(
        queryClient.getQueryData(["books", { user: "alice", isPrivate: true }]),
      ).toBeUndefined();
    });

    it("user changes → request for the new user, caches are not mixed", async () => {
      const alice = [buildBook({ id: "a1", ownerId: "alice" })];
      const bob = [buildBook({ id: "b1", ownerId: "bob" })];
      api.get.mockImplementation(async (url: string) => ({
        data: url === "/books/alice" ? alice : bob,
      }));
      const { result } = setup();
      await waitFor(() =>
        expect(result.current.books.map((b) => b.id)).toEqual(["a1"]),
      );

      act(() => UserStorage.getState().setUser("bob"));

      await waitFor(() =>
        expect(result.current.books.map((b) => b.id)).toEqual(["b1"]),
      );
      expect(api.get).toHaveBeenCalledWith("/books/bob");
      expect(
        queryClient.getQueryData([
          "books",
          { user: "alice", isPrivate: false },
        ]),
      ).toEqual(alice);
      expect(
        queryClient.getQueryData(["books", { user: "bob", isPrivate: false }]),
      ).toEqual(bob);
    });
  });
});
