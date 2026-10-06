import { act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { api } from "../../../shared/testing/utils/api";
import { buildBook } from "../../../shared/testing/utils/builders";
import { deferred } from "../../../shared/testing/utils/deferred";
import { renderController, signIn } from "../../../shared/testing/utils/test-utils";
import { BookListMode } from "../../books-selector/model/books-mode-storage.interface";
import { BookListStorage } from "../../books-selector/model/books-mode-storage.repository";
import { useBooksListController } from "../../books-list/model/books-list.controller";
import { useHeaderAccountController } from "../model/header-account.controller";

describe("useHeaderAccountController", () => {
  it("signed-in user → requests private books and exposes their count", async () => {
    signIn("alice");
    api.get.mockResolvedValue({
      data: [buildBook({ id: "b1" }), buildBook({ id: "b2" })],
    });

    const { result } = renderController(() => useHeaderAccountController());

    await waitFor(() => expect(result.current.count).toBe(2));
    expect(api.get).toHaveBeenCalledWith("/books/alice/private");
  });

  it("pending request → count starts at zero and loading follows isPending", async () => {
    signIn("alice");
    const request = deferred<{ data: ReturnType<typeof buildBook>[] }>();
    api.get.mockReturnValue(request.promise);

    const { result } = renderController(() => useHeaderAccountController());

    expect(result.current.count).toBe(0);
    expect(result.current.loading).toBe(false);

    request.resolve({ data: [buildBook()] });
    await waitFor(() => expect(result.current.count).toBe(1));
  });

  it("empty response → zero; API error → retains zero", async () => {
    signIn("alice");
    api.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderController(() =>
      useHeaderAccountController(),
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    expect(result.current.count).toBe(0);

    // Use a second user so the failing request has a distinct query key.
    api.get.mockRejectedValueOnce(new Error("network failure"));
    act(() => UserStorage.getState().setUser("bob"));

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect(result.current.count).toBe(0);
  });

  it("list mode all → still requests private books", async () => {
    signIn("alice");
    BookListStorage.setState({ mode: BookListMode.all });
    api.get.mockResolvedValue({ data: [] });

    renderController(() => useHeaderAccountController());

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/books/alice/private"),
    );
  });

  it("private list and header → share one private-books request", async () => {
    signIn("alice");
    BookListStorage.setState({ mode: BookListMode.private });
    api.get.mockResolvedValue({ data: [buildBook()] });

    renderController(() => ({
      list: useBooksListController(),
      header: useHeaderAccountController(),
    }));

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    expect(api.get).toHaveBeenCalledWith("/books/alice/private");
  });
});
