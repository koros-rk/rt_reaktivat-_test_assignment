import { describe, expect, it } from "vitest";
import { api } from "../../../../shared/testing/utils/api";
import { buildBook } from "../../../../shared/testing/utils/builders";
import { makeAxiosError } from "../../../../shared/testing/utils/make-axios-error";
import { GetBooksContract } from "../../contracts/get.contract";

describe("GetBooksContract", () => {
  it.each([
    [false, "/books/alice"],
    [true, "/books/alice/private"],
  ])("isPrivate=%s → GET %s", async (isPrivate, url) => {
    api.get.mockResolvedValue({ data: [buildBook()] });

    const res = await GetBooksContract({ user: "alice", isPrivate });

    expect(api.get).toHaveBeenCalledOnce();
    expect(api.get).toHaveBeenCalledWith(url);
    expect(res).toHaveLength(1);
  });

  it("returns the books array", async () => {
    const books = [
      buildBook({ id: "b1" }),
      buildBook({ id: "b2", name: "Emma" }),
    ];
    api.get.mockResolvedValue({ data: books });

    await expect(
      GetBooksContract({ user: "alice", isPrivate: false }),
    ).resolves.toEqual(books);
  });

  it("preserves extra keys of a book", async () => {
    const book = buildBook({ pages: 412, tags: ["sci-fi"] });
    api.get.mockResolvedValue({ data: [book] });

    const [res] = await GetBooksContract({ user: "alice", isPrivate: false });

    expect(res).toEqual(book);
    expect(res).toHaveProperty("pages", 412);
  });

  it("empty array → resolves with empty array", async () => {
    api.get.mockResolvedValue({ data: [] });

    await expect(
      GetBooksContract({ user: "alice", isPrivate: false }),
    ).resolves.toEqual([]);
  });

  it("response is not an array → rejects with issues", async () => {
    api.get.mockResolvedValue({ data: { nope: true } });

    await expect(
      GetBooksContract({ user: "a", isPrivate: false }),
    ).rejects.toHaveProperty("issues");
  });

  it("book without required field → rejects with issues", async () => {
    api.get.mockResolvedValue({ data: [{ id: "b1", name: "Dune" }] });

    await expect(
      GetBooksContract({ user: "a", isPrivate: false }),
    ).rejects.toHaveProperty("issues");
  });

  it("invalid input (isPrivate missing) → rejects and does not perform the request", async () => {
    await expect(
      GetBooksContract({ user: "alice" } as any),
    ).rejects.toHaveProperty("issues");

    expect(api.get).not.toHaveBeenCalled();
  });

  it("server error 500 → rejects with status 500", async () => {
    api.get.mockRejectedValue(
      makeAxiosError({ status: 500, data: { detail: "Boom" } }),
    );

    await expect(
      GetBooksContract({ user: "alice", isPrivate: false }),
    ).rejects.toMatchObject({
      message: "Boom",
      status: 500,
    });
  });

  describe("URL encoding of user", () => {
    it("user with space → encoded in public URL", async () => {
      api.get.mockResolvedValue({ data: [] });

      await GetBooksContract({ user: "a b", isPrivate: false });

      expect(api.get).toHaveBeenCalledWith("/books/a%20b");
    });

    it('user with "/" → encoded in private URL', async () => {
      api.get.mockResolvedValue({ data: [] });

      await GetBooksContract({ user: "a/b", isPrivate: true });

      expect(api.get).toHaveBeenCalledWith("/books/a%2Fb/private");
    });
  });
});
