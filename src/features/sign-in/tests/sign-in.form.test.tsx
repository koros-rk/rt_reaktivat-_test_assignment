import { act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { renderController } from "../../../shared/testing/utils/test-utils";
import { useSignInForm } from "../model/sign-in.form";

describe("useSignInForm", () => {
  it("initial state → closed modal and empty user", () => {
    const { result } = renderController(() => useSignInForm());

    expect(result.current.modal.open).toBe(false);
    expect(result.current.form.form.formId).toBe("sign-in");
    expect(result.current.form.form.state.values.user).toBe("");
  });

  it("empty user → invalid form and no sign-in", async () => {
    const { result } = renderController(() => useSignInForm());
    const form = result.current.form.form;

    await act(async () => form.setFieldValue("user", ""));
    await waitFor(() => expect(form.state.canSubmit).toBe(false));
    await act(async () => form.handleSubmit());

    expect(UserStorage.getState().user).toBeNull();
  });

  it("whitespace-only user → cannot submit", async () => {
    const { result } = renderController(() => useSignInForm());
    const form = result.current.form.form;

    await act(async () => form.setFieldValue("user", "   "));
    await waitFor(() => expect(form.state.canSubmit).toBe(false));
  });

  it("valid user → signs in and closes the modal", async () => {
    const { result } = renderController(() => useSignInForm());
    const form = result.current.form.form;

    act(() => result.current.modal.setOpen(true));
    await act(async () => form.setFieldValue("user", "alice"));
    await waitFor(() => expect(form.state.canSubmit).toBe(true));
    await act(async () => form.handleSubmit());

    expect(UserStorage.getState().user).toBe("alice");
    expect(result.current.modal.open).toBe(false);
  });

  it("modal.setOpen(true) → opens modal", () => {
    const { result } = renderController(() => useSignInForm());

    act(() => result.current.modal.setOpen(true));

    expect(result.current.modal.open).toBe(true);
  });

  it("opening after a successful sign-in resets the user field", async () => {
    const { result } = renderController(() => useSignInForm());
    const form = result.current.form.form;

    await act(async () => form.setFieldValue("user", "alice"));
    await waitFor(() => expect(form.state.canSubmit).toBe(true));
    await act(async () => form.handleSubmit());
    act(() => result.current.modal.setOpen(true));

    await waitFor(() => expect(form.state.values.user).toBe(""));
  });
});
