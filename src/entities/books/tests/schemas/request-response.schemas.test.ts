import { describe, expect, it } from "vitest";
import { buildBook } from "../../../../shared/testing/utils/builders";
import {
  CreateBookRequestSchema,
  CreateBookResponseSchema,
} from "../../schemas/create.schema";
import {
  GetBooksRequestSchema,
  GetBooksResponseSchema,
} from "../../schemas/get.schema";
import {
  ResetBooksRequestSchema,
  ResetBooksResponseSchema,
} from "../../schemas/reset.schema";

describe("GetBooksRequestSchema", () => {
  it("accepts user + boolean isPrivate", () => {
    expect(
      GetBooksRequestSchema.safeParse({ user: "alice", isPrivate: false })
        .success,
    ).toBe(true);
  });

  it("requires isPrivate", () => {
    expect(GetBooksRequestSchema.safeParse({ user: "alice" }).success).toBe(
      false,
    );
  });

  it("isPrivate must be a real boolean", () => {
    expect(
      GetBooksRequestSchema.safeParse({ user: "alice", isPrivate: "true" })
        .success,
    ).toBe(false);
  });

  it("user must be a string", () => {
    expect(
      GetBooksRequestSchema.safeParse({ user: 1, isPrivate: true }).success,
    ).toBe(false);
  });
});

describe("GetBooksResponseSchema", () => {
  it("accepts an empty array", () => {
    expect(GetBooksResponseSchema.safeParse([]).success).toBe(true);
  });

  it("accepts an array of books", () => {
    const r = GetBooksResponseSchema.safeParse([
      buildBook(),
      buildBook({ id: 2, year: "1965" }),
    ]);
    expect(r.success).toBe(true);
  });

  it.each([{}, null, "books"])("rejects non-array %j", (value) => {
    expect(GetBooksResponseSchema.safeParse(value).success).toBe(false);
  });

  it("rejects an item without author (issue path points to the item)", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { author: _omit, ...broken } = buildBook();
    const r = GetBooksResponseSchema.safeParse([buildBook(), broken]);
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path)).toContainEqual([1, "author"]);
  });
});

describe("CreateBookRequestSchema", () => {
  it("accepts user + valid book and keeps extra keys", () => {
    const r = CreateBookRequestSchema.parse({
      user: "alice",
      book: { ...buildBook(), year: "1965" },
    });
    expect(r.book).toMatchObject({ year: "1965" });
  });

  it("validates book through BookSchema (missing author → error)", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { author: _omit, ...broken } = buildBook();
    const r = CreateBookRequestSchema.safeParse({
      user: "alice",
      book: broken,
    });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path)).toContainEqual([
      "book",
      "author",
    ]);
  });

  it("requires user", () => {
    expect(
      CreateBookRequestSchema.safeParse({ book: buildBook() }).success,
    ).toBe(false);
  });
});

describe("ResetBooksRequestSchema", () => {
  it("requires a string user", () => {
    expect(ResetBooksRequestSchema.safeParse({ user: "alice" }).success).toBe(
      true,
    );
    expect(ResetBooksRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe.each([
  ["CreateBookResponseSchema", CreateBookResponseSchema],
  ["ResetBooksResponseSchema", ResetBooksResponseSchema],
])("%s", (_, schema) => {
  it("accepts { status: 'ok' }", () => {
    expect(schema.safeParse({ status: "ok" }).success).toBe(true);
  });

  it("rejects an empty object", () => {
    expect(schema.safeParse({}).success).toBe(false);
  });

  it("rejects a non-string status", () => {
    expect(schema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("accepts any string status (schema does not pin 'ok')", () => {
    expect(schema.safeParse({ status: "error" }).success).toBe(true);
  });
});
