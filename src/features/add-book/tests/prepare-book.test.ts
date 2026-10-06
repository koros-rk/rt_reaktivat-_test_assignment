import { beforeEach, describe, expect, it } from "vitest";
import { signIn } from "../../../shared/testing/utils/test-utils";
import { prepareBook } from "../lib/prepare-book";
import { CreateBookFields } from "../model/create-book.schema";

describe("prepareBook", () => {
  const user = "alice";
  const book = (fields: CreateBookFields = []) => ({
    id: "X1",
    name: "Dune",
    author: "Herbert",
    fields,
  });

  beforeEach(() => signIn("bob")); // стор НЕ має впливати: user передається аргументом

  it("maps id, name, author and ownerId", () => {
    expect(prepareBook(book(), user)).toEqual({
      id: "X1",
      name: "Dune",
      author: "Herbert",
      ownerId: "alice",
    });
  });

  it("takes ownerId from the argument, not from UserStorage", () => {
    expect(prepareBook(book(), "carol").ownerId).toBe("carol");
  });

  it("empty user argument → ownerId is empty string", () => {
    expect(prepareBook(book(), "").ownerId).toBe("");
  });

  it("empty fields → exactly 4 keys", () => {
    expect(Object.keys(prepareBook(book(), user)).sort()).toEqual([
      "author",
      "id",
      "name",
      "ownerId",
    ]);
  });

  it("flattens custom fields and drops their internal ids", () => {
    const res = prepareBook(
      book([{ id: "f1", name: "year", value: "1965" }]),
      user,
    );
    expect(res).toMatchObject({ year: "1965" });
    expect(res).not.toHaveProperty("fields");
    expect(Object.values(res)).not.toContain("f1");
    expect(Object.keys(res)).toHaveLength(5);
  });

  it("keeps values as strings (no type coercion)", () => {
    const res = prepareBook(
      book([
        { id: "f1", name: "year", value: "1965" },
        { id: "f2", name: "flag", value: "true" },
      ]),
      user,
    );
    expect(res.year).toBe("1965");
    expect(res.flag).toBe("true");
  });

  it("last duplicate name wins", () => {
    const res = prepareBook(
      book([
        { id: "f1", name: "year", value: "1965" },
        { id: "f2", name: "year", value: "1999" },
      ]),
      user,
    );
    expect(res.year).toBe("1999");
  });

  it("normalizes custom field name", () => {
    const res = prepareBook(
      book([{ id: "f1", name: "  yEAr   ", value: "1965" }]),
      user,
    );
    expect(res.year).toBe("1965");
  });

  it.each(["id", "name", "author", "ownerId"])(
    "custom field named '%s' cannot override the reserved key",
    (reserved) => {
      const res = prepareBook(
        book([{ id: "f", name: reserved, value: "hacker" }]),
        user,
      );
      expect(res).toMatchObject({
        id: "X1",
        name: "Dune",
        author: "Herbert",
        ownerId: "alice",
      });
    },
  );

  it("does not mutate input", () => {
    const input = book([{ id: "f", name: "a", value: "b" }]);
    const copy = structuredClone(input);
    prepareBook(input, user);
    expect(input).toEqual(copy);
  });
});
