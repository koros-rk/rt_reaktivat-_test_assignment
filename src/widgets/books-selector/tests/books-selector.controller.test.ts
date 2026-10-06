import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookListMode } from "../model/books-mode-storage.interface";
import { BookListStorage } from "../model/books-mode-storage.repository";
import { useBooksSelectorButtonController } from "../model/books-selector.controller";

describe("useBooksSelectorButtonController", () => {
  it.each([
    [BookListMode.all, BookListMode.all, true, "solid"],
    [BookListMode.private, BookListMode.private, true, "solid"],
    [BookListMode.all, BookListMode.private, false, "outline"],
    [BookListMode.private, BookListMode.all, false, "outline"],
  ])(
    "mode=%s target=%s → isActive=%s variant=%s",
    (mode, target, isActive, variant) => {
      BookListStorage.setState({ mode });

      const { result } = renderHook(() =>
        useBooksSelectorButtonController(target),
      );

      expect(result.current).toMatchObject({ isActive, variant });
    },
  );

  it("select() → sets the target mode in the store", () => {
    const { result } = renderHook(() =>
      useBooksSelectorButtonController(BookListMode.private),
    );

    act(() => result.current.select());

    expect(BookListStorage.getState().mode).toBe(BookListMode.private);
  });

  it("select() → button state is updated", () => {
    const { result } = renderHook(() =>
      useBooksSelectorButtonController(BookListMode.private),
    );
    expect(result.current).toMatchObject({
      isActive: false,
      variant: "outline",
    });

    act(() => result.current.select());

    expect(result.current).toMatchObject({ isActive: true, variant: "solid" });
  });

  it("exactly one of the two buttons is active at any moment", () => {
    const all = renderHook(() =>
      useBooksSelectorButtonController(BookListMode.all),
    );
    const prv = renderHook(() =>
      useBooksSelectorButtonController(BookListMode.private),
    );
    expect([all.result.current.isActive, prv.result.current.isActive]).toEqual([
      true,
      false,
    ]);

    act(() => prv.result.current.select());
    expect([all.result.current.isActive, prv.result.current.isActive]).toEqual([
      false,
      true,
    ]);

    act(() => all.result.current.select());
    expect([all.result.current.isActive, prv.result.current.isActive]).toEqual([
      true,
      false,
    ]);
  });

  it("select() on the already active button → mode stays the same", () => {
    const { result } = renderHook(() =>
      useBooksSelectorButtonController(BookListMode.all),
    );

    act(() => result.current.select());

    expect(BookListStorage.getState().mode).toBe(BookListMode.all);
    expect(result.current.isActive).toBe(true);
  });

  it("same mode is set again → hook does not re-render", () => {
    let renders = 0;
    renderHook(() => {
      renders++;
      return useBooksSelectorButtonController(BookListMode.all);
    });
    const before = renders;

    act(() => BookListStorage.getState().setMode(BookListMode.all));

    expect(renders).toBe(before);
  });

  it("inactive button + mode changes between the other values → no re-render", () => {
    let renders = 0;
    renderHook(() => {
      renders++;
      return useBooksSelectorButtonController(BookListMode.private);
    });
    const before = renders;

    act(() => BookListStorage.getState().setMode(BookListMode.all));

    expect(renders).toBe(before);
  });
});
