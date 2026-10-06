import { describe, expect, it } from "vitest";
import { api } from "../../../../shared/testing/utils/api";
import { makeAxiosError } from "../../../../shared/testing/utils/make-axios-error";
import { ResetBooksContract } from "../../contracts/reset.contract";

describe("ResetBooksContract", () => {
  it("PUT /books/:user/reset without body", async () => {
    api.put.mockResolvedValue({ data: { status: "ok" } });

    await ResetBooksContract({ user: "alice" });

    expect(api.put).toHaveBeenCalledOnce();
    expect(api.put).toHaveBeenCalledWith("/books/alice/reset");
  });

  it("returns { status }", async () => {
    api.put.mockResolvedValue({ data: { status: "ok" } });

    await expect(ResetBooksContract({ user: "alice" })).resolves.toEqual({
      status: "ok",
    });
  });

  it("response without status → rejects with issues", async () => {
    api.put.mockResolvedValue({ data: {} });

    await expect(ResetBooksContract({ user: "alice" })).rejects.toHaveProperty(
      "issues",
    );
  });

  it("404 → rejects with status 404", async () => {
    api.put.mockRejectedValue(
      makeAxiosError({ status: 404, data: { detail: "Not found" } }),
    );

    await expect(ResetBooksContract({ user: "alice" })).rejects.toMatchObject({
      message: "Not found",
      status: 404,
    });
  });
});
