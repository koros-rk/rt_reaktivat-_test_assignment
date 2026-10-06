import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { useMainPageController } from "../model/main-page.controller";
import { MainPageScreens } from "../model/main-page.screens";

describe("useMainPageController", () => {
  it.each([
    [null, MainPageScreens.Unauthorized],
    ["", MainPageScreens.Unauthorized],
    ["alice", MainPageScreens.SignedIn],
  ])("user=%j → %s", (user, expected) => {
    UserStorage.setState({ user });

    const { result } = renderHook(() => useMainPageController());

    expect(result.current.pageState).toBe(expected);
  });

  it("user signs in and out → screen switches without remounting", () => {
    const { result } = renderHook(() => useMainPageController());
    expect(result.current.pageState).toBe(MainPageScreens.Unauthorized);

    act(() => UserStorage.getState().setUser("alice"));
    expect(result.current.pageState).toBe(MainPageScreens.SignedIn);

    act(() => UserStorage.getState().clearUser());
    expect(result.current.pageState).toBe(MainPageScreens.Unauthorized);
  });

  it("user changes from one name to another → stays SignedIn", () => {
    UserStorage.setState({ user: "alice" });
    const { result } = renderHook(() => useMainPageController());

    act(() => UserStorage.getState().setUser("bob"));

    expect(result.current.pageState).toBe(MainPageScreens.SignedIn);
  });

  it("MainPageScreens enum values are stable", () => {
    expect(MainPageScreens.SignedIn).toBe("SignedIn");
    expect(MainPageScreens.Unauthorized).toBe("Unauthorized");
  });
});
