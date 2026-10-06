import { describe, expect, it } from "vitest";
import { api } from "../../../../shared/testing/utils/api";
import { buildBook } from "../../../../shared/testing/utils/builders";
import { makeAxiosError } from "../../../../shared/testing/utils/make-axios-error";
import { CreateBookContract } from "../../contracts/create.contract";

describe("CreateBookContract", () => {
  it("posts only the book to /books/:user", async () => {
    api.post.mockResolvedValue({ data: { status: "ok" } });
    const book = buildBook();

    await CreateBookContract({ user: "alice", book });

    expect(api.post).toHaveBeenCalledOnce();
    expect(api.post).toHaveBeenCalledWith("/books/alice", book);
  });

  it("returns { status }", async () => {
    api.post.mockResolvedValue({ data: { status: "ok" } });

    await expect(
      CreateBookContract({ user: "alice", book: buildBook() }),
    ).resolves.toEqual({
      status: "ok",
    });
  });

  it("response without status → rejects with issues", async () => {
    api.post.mockResolvedValue({ data: {} });

    await expect(
      CreateBookContract({ user: "alice", book: buildBook() }),
    ).rejects.toHaveProperty("issues");
  });

  it("invalid input (book missing) → rejects and does not perform the request", async () => {
    await expect(
      CreateBookContract({ user: "alice" } as any),
    ).rejects.toHaveProperty("issues");

    expect(api.post).not.toHaveBeenCalled();
  });

  it("error 500 → rejects with { message, status: 500 }", async () => {
    api.post.mockRejectedValue(
      makeAxiosError({ status: 500, data: { detail: "Server error" } }),
    );

    await expect(
      CreateBookContract({ user: "alice", book: buildBook() }),
    ).rejects.toMatchObject({
      message: "Server error",
      status: 500,
    });
  });

  it("user with space → encoded in URL", async () => {
    api.post.mockResolvedValue({ data: { status: "ok" } });
    const book = buildBook();

    await CreateBookContract({ user: "a b", book });

    expect(api.post).toHaveBeenCalledWith("/books/a%20b", book);
  });
});
