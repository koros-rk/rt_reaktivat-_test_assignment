import { describe, expect, it } from "vitest";
import { Book } from "../../../entities/books/schemas/book.schema";
import { buildBook } from "../../../shared/testing/utils/builders";
import { useBookItemController } from "../model/book-item.controller";

describe("useBookItemController", () => {
  it.each([
    ["placeholder-0", true],
    ["placeholder-3", true],
    ["abc", false],
    [5, false],
  ])("book id=%j → isPlaceholder=%s", (id, expected) => {
    const book = buildBook({ id } as unknown as Partial<Book>);

    expect(useBookItemController(book, 0).isPlaceholder).toBe(expected);
  });

  it("real book with placeholder-like id → is not a placeholder", () => {
    const book = buildBook({ id: "placeholder-x" });

    expect(useBookItemController(book, 0).isPlaceholder).toBe(false);
  });
});
