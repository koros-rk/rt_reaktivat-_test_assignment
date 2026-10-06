import { describe, expect, it } from "vitest";
import { queryClient } from "../../../../shared/api/query-client";
import {
  readBooks,
  seedBooks,
} from "../../../../shared/testing/utils/books-cache";
import { buildBook } from "../../../../shared/testing/utils/builders";
import { runMutation } from "../../../../shared/testing/utils/run-mutation";
import { signIn } from "../../../../shared/testing/utils/test-utils";
import { SignOutMutation } from "../../mutations/sign-out.mutation";
import { UserStorage } from "../../storage/user-storage.repository";

describe("SignOutMutation", () => {
  it('mutationKey → ["user", "sign-out"]', () => {
    expect(SignOutMutation.mutationKey).toEqual(["user", "sign-out"]);
  });

  it("sign-out → clears user from store and persisted state", async () => {
    signIn("alice");

    await runMutation(SignOutMutation, undefined);

    expect(UserStorage.getState().user).toBeNull();
    expect(JSON.parse(localStorage.getItem("user-storage")!).state.user).toBe(
      null,
    );
  });

  it("sign-out when already signed out → resolves without error", async () => {
    await expect(
      runMutation(SignOutMutation, undefined),
    ).resolves.toBeUndefined();
    expect(UserStorage.getState().user).toBeNull();
  });

  it("sign-out → keeps user-keyed book caches in memory", async () => {
    signIn("alice");
    const books = [buildBook()];
    seedBooks("alice", books, books);

    await runMutation(SignOutMutation, undefined);

    expect(readBooks("alice", false)).toBe(books);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(2);
  });
});
