import { describe, expect, it, vi } from "vitest";
import { UserStorage } from "../../storage/user-storage.repository";

const STORAGE_KEY = "user-storage";

describe("UserStorage", () => {
  it("initial state → user is null", () => {
    expect(UserStorage.getState().user).toBeNull();
  });

  it('setUser("alice") → user is "alice"', () => {
    UserStorage.getState().setUser("alice");

    expect(UserStorage.getState().user).toBe("alice");
  });

  it("clearUser() → user is null", () => {
    UserStorage.getState().setUser("alice");

    UserStorage.getState().clearUser();

    expect(UserStorage.getState().user).toBeNull();
  });

  it("setUser called again with another value → replaces the previous user", () => {
    UserStorage.getState().setUser("alice");

    UserStorage.getState().setUser("bob");

    expect(UserStorage.getState().user).toBe("bob");
  });

  describe("persist", () => {
    it('setUser → localStorage["user-storage"] contains state.user', () => {
      UserStorage.getState().setUser("alice");

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

      expect(saved.state.user).toBe("alice");
    });

    it("actions (setUser, clearUser) are not serialized", () => {
      UserStorage.getState().setUser("alice");

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

      expect(saved.state).toEqual({ user: "alice" });
    });

    it("clearUser → persisted user becomes null", () => {
      UserStorage.getState().setUser("alice");

      UserStorage.getState().clearUser();

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(saved.state.user).toBeNull();
    });

    it('rehydrate with user "bob" in localStorage → user is "bob"', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: { user: "bob" }, version: 0 }),
      );

      await UserStorage.persist.rehydrate();

      expect(UserStorage.getState().user).toBe("bob");
    });

    it("rehydrate keeps actions working", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: { user: "bob" }, version: 0 }),
      );
      await UserStorage.persist.rehydrate();

      UserStorage.getState().clearUser();

      expect(UserStorage.getState().user).toBeNull();
    });
  });

  describe("subscribe", () => {
    it("setUser → listener is called once", () => {
      const listener = vi.fn();
      const unsubscribe = UserStorage.subscribe(listener);

      UserStorage.getState().setUser("alice");

      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("listener receives new and previous state", () => {
      const listener = vi.fn();
      const unsubscribe = UserStorage.subscribe(listener);

      UserStorage.getState().setUser("alice");

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ user: "alice" }),
        expect.objectContaining({ user: null }),
      );
      unsubscribe();
    });

    it("after unsubscribe → listener is not called", () => {
      const listener = vi.fn();
      const unsubscribe = UserStorage.subscribe(listener);
      unsubscribe();

      UserStorage.getState().setUser("alice");

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
