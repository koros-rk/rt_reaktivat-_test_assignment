import { afterEach, describe, expect, it, vi } from "vitest";
import { getShortId } from "../lib/get-short-id";

describe("getShortId", () => {
  afterEach(() => vi.restoreAllMocks());

  it("defaults to length 8", () => {
    expect(getShortId()).toHaveLength(8);
  });

  it.each([0, 1, 16, 32])("returns a string of length %i", (length) => {
    expect(getShortId(length)).toHaveLength(length);
  });

  it("length 0 → empty string", () => {
    expect(getShortId(0)).toBe("");
  });

  it("uses only [0-9a-zA-Z]", () => {
    for (let i = 0; i < 200; i++) {
      expect(getShortId(32)).toMatch(/^[0-9a-zA-Z]{32}$/);
    }
  });

  it("maps bytes to alphabet deterministically", () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation((arr: any) => {
      arr.set([0, 1, 10, 36, 61, 62]); // 62 % 62 === 0
      return arr;
    });
    expect(getShortId(6)).toBe("01aAZ0");
  });

  it("is unique enough (1000 ids, no collisions)", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => getShortId()));
    expect(ids.size).toBe(1000);
  });
});
