import { describe, expect, it } from "vitest";
import { runMutation } from "../../../../shared/testing/utils/run-mutation";
import { SignInMutation } from "../../mutations/sign-in.mutation";
import { UserStorage } from "../../storage/user-storage.repository";

describe("SignInMutation", () => {
  it('mutationKey → ["user", "sign-in"]', () => {
    expect(SignInMutation.mutationKey).toEqual(["user", "sign-in"]);
  });

  it('sign-in as "alice" → updates the user store', async () => {
    await runMutation(SignInMutation, "alice");

    expect(UserStorage.getState().user).toBe("alice");
  });

  it("sign-in as another name → replaces the previous user", async () => {
    await runMutation(SignInMutation, "alice");
    await runMutation(SignInMutation, "bob");

    expect(UserStorage.getState().user).toBe("bob");
  });

  it("sign-in → persists user in localStorage", async () => {
    await runMutation(SignInMutation, "alice");

    expect(JSON.parse(localStorage.getItem("user-storage")!).state.user).toBe(
      "alice",
    );
  });

  it("empty string → mutation stores it as-is (validation belongs to SignInSchema)", async () => {
    await runMutation(SignInMutation, "");

    expect(UserStorage.getState().user).toBe("");
  });
});
