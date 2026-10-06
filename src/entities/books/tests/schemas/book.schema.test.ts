import { describe, expect, it } from "vitest";
import { buildBook } from "../../../../shared/testing/utils/builders";
import { BookSchema } from "../../schemas/book.schema";

describe("BookSchema", () => {
  it("keeps unknown keys on a book", () => {
    const parsed = BookSchema.parse({ ...buildBook(), year: "1965" });
    expect(parsed).toMatchObject({ year: "1965" });
  });

  it.each([{ id: 1 }, { id: "a" }])("accepts id %j", (p) => {
    expect(BookSchema.safeParse({ ...buildBook(), ...p }).success).toBe(true);
  });

  it("keeps a numeric id as a number", () => {
    expect(BookSchema.parse(buildBook({ id: 7 })).id).toBe(7);
  });

  it.each(["name", "author", "ownerId"])("missing %s → error", (key) => {
    const book: Record<string, unknown> = { ...buildBook() };
    delete book[key];
    const r = BookSchema.safeParse(book);
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path)).toContainEqual([key]);
  });

  it("id: null → error", () => {
    const r = BookSchema.safeParse({ ...buildBook(), id: null });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path)).toContainEqual(["id"]);
  });
});
