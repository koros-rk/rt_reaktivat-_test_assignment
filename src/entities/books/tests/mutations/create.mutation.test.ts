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
import { useHeaderAccountController } from "../../../../widgets/header/model/header-account.controller";
import { CreateBookMutation } from "../../mutations/create.mutation";
import { Book } from "../../schemas/book.schema";

const existing = [buildBook({ id: "b1" }), buildBook({ id: "b2" })];
const created = buildBook({
  id: "new",
  year: "1965",
  genre: "science fiction",
});
const create = (user = "alice", book: Book = created) =>
  runMutation(CreateBookMutation, { user, book });

describe("CreateBookMutation", () => {
  beforeEach(() => {
    api.post.mockResolvedValue({ data: { status: "ok" } });
  });

  it('mutationKey → ["books", "create"]', () => {
    expect(CreateBookMutation.mutationKey).toEqual(["books", "create"]);
  });

  it("valid payload → posts only the book", async () => {
    await create();

    expect(api.post).toHaveBeenCalledWith("/books/alice", created);
  });

  it("success → appends to public and private caches, preserving order", async () => {
    seedBooks("alice", existing, existing);

    await create();

    for (const isPrivate of [false, true]) {
      expect(readBooks("alice", isPrivate)?.map(({ id }) => id)).toEqual([
        "b1",
        "b2",
        "new",
      ]);
    }
    expect(readBooks("alice", true)?.[2]).toMatchObject({
      year: "1965",
      genre: "science fiction",
    });
  });

  it("success → replaces cache arrays without mutating previous arrays", async () => {
    seedBooks("alice", existing, existing);
    const previousAll = readBooks("alice", false);
    const previousPrivate = readBooks("alice", true);

    await create();

    expect(previousAll).toHaveLength(2);
    expect(previousPrivate).toHaveLength(2);
    expect(readBooks("alice", false)).not.toBe(previousAll);
    expect(readBooks("alice", true)).not.toBe(previousPrivate);
  });

  it("payload user → other users' caches stay unchanged", async () => {
    const bobAll = [buildBook({ id: "bob-all", ownerId: "bob" })];
    const bobPrivate = [buildBook({ id: "bob-private", ownerId: "bob" })];
    seedBooks("alice", existing, existing);
    seedBooks("bob", bobAll, bobPrivate);

    await create("alice");

    expect(readBooks("bob", false)).toBe(bobAll);
    expect(readBooks("bob", true)).toBe(bobPrivate);
  });

  it("pending request → cache changes only after server success", async () => {
    seedBooks("alice", existing, existing);
    const request = deferred<{ data: { status: string } }>();
    api.post.mockReturnValue(request.promise);

    const pending = create();
    expect(readBooks("alice", false)).toBe(existing);
    expect(readBooks("alice", true)).toBe(existing);

    request.resolve({ data: { status: "ok" } });
    await pending;

    expect(readBooks("alice", false)).toHaveLength(3);
    expect(readBooks("alice", true)).toHaveLength(3);
  });

  it("missing private cache → does not create a partial cache", async () => {
    seedBooks("alice", existing, existing);
    queryClient.removeQueries({
      queryKey: booksKey("alice", true),
      exact: true,
    });

    await create();

    expect(readBooks("alice", false)).toHaveLength(3);
    expect(readBooks("alice", true)).toBeUndefined();
  });

  it("API 500 → rejects, preserves caches, and shows one toast", async () => {
    seedBooks("alice", existing, existing);
    api.post.mockRejectedValue(makeAxiosError({ status: 500 }));

    await expect(create()).rejects.toMatchObject({ status: 500 });

    expect(readBooks("alice", false)).toBe(existing);
    expect(readBooks("alice", true)).toBe(existing);
    expect(enqueueSnackbar).toHaveBeenCalledOnce();
  });

  it("invalid response → rejects with issues and preserves caches", async () => {
    seedBooks("alice", existing, existing);
    api.post.mockResolvedValue({ data: {} });

    await expect(create()).rejects.toHaveProperty("issues");

    expect(readBooks("alice", false)).toBe(existing);
    expect(readBooks("alice", true)).toBe(existing);
    expect(enqueueSnackbar).toHaveBeenCalledOnce();
  });

  it("book without author → rejects before making a request", async () => {
    const { author: _author, ...invalidBook } = created;

    await expect(create("alice", invalidBook as Book)).rejects.toHaveProperty(
      "issues",
    );

    expect(api.post).not.toHaveBeenCalled();
  });

  it("mounted header → count updates from shared cache without another GET", async () => {
    signIn("alice");
    api.get.mockResolvedValue({ data: [buildBook({ id: "b1" })] });
    const { result } = renderController(() => useHeaderAccountController());
    await waitFor(() => expect(result.current.count).toBe(1));

    await act(async () => create());

    await waitFor(() => expect(result.current.count).toBe(2));
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
