import { describe, expect, it, vi } from "vitest";
import { BookListMode } from "../model/books-mode-storage.interface";
import { BookListStorage } from "../model/books-mode-storage.repository";

describe("BookListMode", () => {
  it("enum values match what the controller compares against", () => {
    expect(BookListMode.all).toBe("all");
    expect(BookListMode.private).toBe("private");
  });

  it("enum has exactly two modes", () => {
    expect(Object.values(BookListMode).sort()).toEqual(["all", "private"]);
  });
});

describe("BookListStorage", () => {
  it("initial mode → BookListMode.all", () => {
    expect(BookListStorage.getState().mode).toBe(BookListMode.all);
  });

  it('setMode(private) → mode is "private"', () => {
    BookListStorage.getState().setMode(BookListMode.private);

    expect(BookListStorage.getState().mode).toBe("private");
  });

  it('setMode(all) after private → mode is "all"', () => {
    BookListStorage.getState().setMode(BookListMode.private);

    BookListStorage.getState().setMode(BookListMode.all);

    expect(BookListStorage.getState().mode).toBe("all");
  });

  it("setMode with the same value → mode stays the same", () => {
    BookListStorage.getState().setMode(BookListMode.private);

    BookListStorage.getState().setMode(BookListMode.private);

    expect(BookListStorage.getState().mode).toBe(BookListMode.private);
  });

  it("setMode → subscriber receives the new mode", () => {
    const listener = vi.fn();
    const unsubscribe = BookListStorage.subscribe(listener);

    BookListStorage.getState().setMode(BookListMode.private);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ mode: BookListMode.private }),
      expect.objectContaining({ mode: BookListMode.all }),
    );
    unsubscribe();
  });

  it("does not persist → nothing is written to localStorage", () => {
    // setup.ts скидає UserStorage після кожного тесту, що створює запис "user-storage";
    // тому чистимо localStorage безпосередньо перед перевіркою.
    localStorage.clear();

    BookListStorage.getState().setMode(BookListMode.private);

    expect(localStorage.length).toBe(0);
  });
});
