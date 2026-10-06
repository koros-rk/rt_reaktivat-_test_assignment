import { describe, expect, it } from "vitest";
import { BookSchema } from "../../../entities/books/schemas/book.schema";
import {
  getPlaceholderBooks,
  PLACEHOLDER_BOOKS,
} from "../lib/get-placeholder-books";

describe("getPlaceholderBooks", () => {
  it("returns exactly 20 items", () => {
    expect(getPlaceholderBooks()).toHaveLength(20);
  });

  it("ids start with 'placeholder-' and are unique", () => {
    const ids = getPlaceholderBooks().map((b) => String(b.id));
    expect(ids.every((id) => id.startsWith("placeholder-"))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every item passes BookSchema", () => {
    for (const book of getPlaceholderBooks()) {
      expect(BookSchema.safeParse(book).success).toBe(true);
    }
  });

  it("separate calls return separate arrays and objects", () => {
    const a = getPlaceholderBooks();
    const b = getPlaceholderBooks();
    expect(a).not.toBe(b);
    expect(a[0]).not.toBe(b[0]);
    expect(a).toEqual(b);
  });

  it("PLACEHOLDER_BOOKS equals a fresh result", () => {
    expect(PLACEHOLDER_BOOKS).toEqual(getPlaceholderBooks());
  });
});
