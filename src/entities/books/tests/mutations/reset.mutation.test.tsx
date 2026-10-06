import { QueryObserver } from "@tanstack/react-query";
import { act, waitFor } from "@testing-library/react";
import { enqueueSnackbar } from "notistack";
import { beforeEach, describe, expect, it } from "vitest";
import { queryClient } from "../../../../shared/api/query-client";
import { api } from "../../../../shared/testing/utils/api";
import {
  booksKey,
  readBooks,
  seedBooks,
} from "../../../../shared/testing/utils/books-cache";
import { buildBook } from "../../../../shared/testing/utils/builders";
import { deferred } from "../../../../shared/testing/utils/deferred";
import { makeAxiosError } from "../../../../shared/testing/utils/make-axios-error";
import { runMutation } from "../../../../shared/testing/utils/run-mutation";
import {
  renderController,
  signIn,
} from "../../../../shared/testing/utils/test-utils";
import { useBooksListController } from "../../../../widgets/books-list/model/books-list.controller";
import { ResetBookMutation } from "../../mutations/reset.mutation";
import { GetBooksQuery } from "../../queries/get.query";

const watchBooks = (user: string, isPrivate: boolean) =>
  new QueryObserver(queryClient, GetBooksQuery({ user, isPrivate })).subscribe(
    () => {},
  );

describe("ResetBookMutation", () => {
  beforeEach(() => {
    api.put.mockResolvedValue({ data: { status: "ok" } });
  });

  it('mutationKey → ["books", "reset"]', () => {
    expect(ResetBookMutation.mutationKey).toEqual(["books", "reset"]);
  });

  it("valid payload → puts to reset endpoint and returns status", async () => {
    await expect(
      runMutation(ResetBookMutation, { user: "alice" }),
    ).resolves.toEqual({ status: "ok" });
    expect(api.put).toHaveBeenCalledWith("/books/alice/reset");
  });

  it("success → refetches active books queries and invalidates the rest", async () => {
    const alicePrivate = [buildBook({ id: "alice-private" })];
    const aliceAll = [buildBook({ id: "alice-all" })];
    const bobPrivate = [buildBook({ id: "bob-private", ownerId: "bob" })];
    seedBooks("alice", aliceAll, alicePrivate);
    seedBooks("bob", [], bobPrivate);
    queryClient.setQueryData(["other"], 1);
    api.get.mockResolvedValue({ data: [] });
    const unsubscribe = watchBooks("alice", true);
    await waitFor(() =>
      expect(queryClient.getQueryState(booksKey("alice", true))?.status).toBe(
        "success",
      ),
    );
    api.get.mockClear();

    await runMutation(ResetBookMutation, { user: "alice" });

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    expect(api.get).toHaveBeenCalledWith("/books/alice/private");
    for (const key of [
      booksKey("alice", false),
      booksKey("bob", false),
      booksKey("bob", true),
    ]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
    expect(readBooks("alice", true)).toEqual([]);
    expect(queryClient.getQueryState(["other"])?.isInvalidated).toBe(false);
    unsubscribe();
  });

  it("pending PUT → books are not refetched until reset succeeds", async () => {
    api.get.mockResolvedValue({ data: [] });
    const unsubscribe = watchBooks("alice", false);
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    api.get.mockClear();
    const request = deferred<{ data: { status: string } }>();
    api.put.mockReturnValue(request.promise);

    const pending = runMutation(ResetBookMutation, { user: "alice" });
    expect(api.get).not.toHaveBeenCalled();

    request.resolve({ data: { status: "ok" } });
    await pending;
    expect(api.get).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("API error → rejects without invalidation or refetch and shows one toast", async () => {
    const cachedBooks = [buildBook()];
    seedBooks("alice", cachedBooks, []);
    api.get.mockResolvedValue({ data: [] });
    api.put.mockRejectedValue(makeAxiosError({ status: 500 }));

    await expect(
      runMutation(ResetBookMutation, { user: "alice" }),
    ).rejects.toMatchObject({ status: 500 });

    expect(api.get).not.toHaveBeenCalled();
    expect(
      queryClient.getQueryState(booksKey("alice", false))?.isInvalidated,
    ).toBe(false);
    expect(readBooks("alice", false)).toBe(cachedBooks);
    expect(enqueueSnackbar).toHaveBeenCalledOnce();
  });

  it("mounted list → displays the server's empty list after reset", async () => {
    signIn("alice");
    api.get.mockResolvedValueOnce({ data: [buildBook({ id: "b1" })] });
    const { result } = renderController(() => useBooksListController());
    await waitFor(() =>
      expect(result.current.books.map(({ id }) => id)).toEqual(["b1"]),
    );
    api.get.mockResolvedValue({ data: [] });

    await act(async () => {
      await runMutation(ResetBookMutation, { user: "alice" });
    });

    await waitFor(() => expect(result.current.books).toEqual([]));
    expect(api.get).toHaveBeenLastCalledWith("/books/alice");
  });
});
