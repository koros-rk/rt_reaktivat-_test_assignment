import { describe, expect, it } from "vitest";
import { CreateBookSchema } from "../model/create-book.schema";

type Field = { id: string; name: string; value: string };
type Patch = {
  user?: unknown;
  book?: { id?: string; name?: string; author?: string; fields?: Field[] };
};

const valid = {
  user: "alice",
  book: { id: "X1", name: "Dune", author: "H", fields: [] as Field[] },
};

// book зливається глибоко, щоб кожен кейс ламав ТІЛЬКИ одне поле
const parse = (patch: Patch = {}) =>
  CreateBookSchema.safeParse({
    ...valid,
    ...patch,
    book: { ...valid.book, ...patch.book },
  });

const paths = (r: ReturnType<typeof parse>) =>
  r.error!.issues.map((i) => i.path);

describe("CreateBookSchema", () => {
  it("accepts valid payload", () => expect(parse().success).toBe(true));

  it("accepts an empty fields array", () => {
    expect(parse({ book: { fields: [] } }).success).toBe(true);
  });

  it("accepts a valid custom field", () => {
    const r = parse({
      book: { fields: [{ id: "f", name: "year", value: "1965" }] },
    });
    expect(r.success).toBe(true);
  });

  it.each([
    ["empty name", { book: { name: "" } }, ["book", "name"]],
    ["empty author", { book: { author: "" } }, ["book", "author"]],
    [
      "empty prop name",
      { book: { fields: [{ id: "f", name: "", value: "v" }] } },
      ["book", "fields", 0, "name"],
    ],
    [
      "empty prop value",
      { book: { fields: [{ id: "f", name: "n", value: "" }] } },
      ["book", "fields", 0, "value"],
    ],
  ] as [string, Patch, (string | number)[]][])(
    "%s → single issue at path",
    (_, patch, path) => {
      const r = parse(patch);
      expect(r.success).toBe(false);
      expect(paths(r)).toEqual([path]); // рівно одна помилка і саме на цьому шляху
    },
  );

  it("empty name → too_small with minimum 1", () => {
    const issue = parse({ book: { name: "" } }).error!.issues[0];
    expect(issue).toMatchObject({ code: "too_small", minimum: 1 });
  });

  it("missing user → error at ['user']", () => {
    const { user: _omit, ...withoutUser } = valid;
    const r = CreateBookSchema.safeParse(withoutUser);
    expect(r.success).toBe(false);
    expect(paths(r as ReturnType<typeof parse>)).toContainEqual(["user"]);
  });

  it("returns all errors at once (one per invalid field)", () => {
    const r = parse({
      book: {
        name: "",
        author: "",
        fields: [{ id: "f", name: "", value: "" }],
      },
    });
    expect(r.success).toBe(false);
    expect(paths(r)).toEqual(
      expect.arrayContaining([
        ["book", "name"],
        ["book", "author"],
        ["book", "fields", 0, "name"],
        ["book", "fields", 0, "value"],
      ]),
    );
    expect(r.error!.issues).toHaveLength(4);
  });

  it("reports the index of the invalid custom field", () => {
    const r = parse({
      book: {
        fields: [
          { id: "a", name: "ok", value: "ok" },
          { id: "b", name: "ok2", value: "" },
        ],
      },
    });
    expect(paths(r)).toEqual([["book", "fields", 1, "value"]]);
  });

  it("empty user string passes (schema does not require a user)", () => {
    expect(parse({ user: "" }).success).toBe(true);
  });

  it("rejects duplicate custom field names", () => {
    const r = parse({
      book: {
        fields: [
          { id: "a", name: "year", value: "1" },
          { id: "b", name: "year", value: "2" },
        ],
      },
    });
    expect(r.success).toBe(false);
  });
});
