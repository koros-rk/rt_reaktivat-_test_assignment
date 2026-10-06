import { act, renderHook } from "@testing-library/react";
import { Component, PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signIn } from "../../../../shared/testing/utils/test-utils";
import {
  useRequiredUserStorage,
  UserStorage,
} from "../../storage/user-storage.repository";

class Boundary extends Component<
  PropsWithChildren<{ onError: (e: Error) => void }>,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const renderWithBoundary = () => {
  const onError = vi.fn();
  const view = renderHook(() => useRequiredUserStorage(), {
    wrapper: ({ children }) => (
      <Boundary onError={onError}>{children}</Boundary>
    ),
  });
  return { ...view, onError };
};

describe("useRequiredUserStorage", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // React логує помилку рендеру
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('user is signed in → returns { user: "alice" }', () => {
    signIn("alice");

    const { result } = renderHook(() => useRequiredUserStorage());

    expect(result.current).toEqual({ user: "alice" });
  });

  it("nobody is signed in → throws error about authenticated screen", () => {
    const { onError } = renderWithBoundary();

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toMatch(/authenticated screen/);
  });

  it("setUser while mounted → re-renders with the new user", () => {
    signIn("alice");
    const { result } = renderHook(() => useRequiredUserStorage());

    act(() => UserStorage.getState().setUser("bob"));

    expect(result.current.user).toBe("bob");
  });

  it("⚠️ known risk: clearUser while the hook is mounted → render error", () => {
    signIn("alice");
    const { onError } = renderWithBoundary();
    expect(onError).not.toHaveBeenCalled();

    act(() => UserStorage.getState().clearUser());

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0].message).toMatch(/authenticated screen/);
  });
});
