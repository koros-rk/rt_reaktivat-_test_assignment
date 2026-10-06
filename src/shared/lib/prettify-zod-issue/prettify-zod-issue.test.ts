import { afterEach, describe, expect, it } from "vitest";
import type { z } from "zod";
import { CreateBookSchema } from "../../../features/add-book/model/create-book.schema";
import i18n from "../i18n/i18n.instance";
import enValidation from "../i18n/translations/en/validation.json";
import { prettifyZodError } from "./prettify-zod-issue";

const issue = (over: Record<string, unknown> = {}) =>
  ({
    code: "too_small",
    minimum: 1,
    origin: "string",
    path: ["user"],
    message: "x",
    ...over,
  }) as z.core.$ZodIssue;

const addTranslations = (bundle: Record<string, unknown>) =>
  i18n.addResourceBundle("en", "validation", bundle, true, true);

afterEach(() => {
  i18n.removeResourceBundle("en", "validation");
  i18n.addResourceBundle("en", "validation", enValidation);
});

describe("prettifyZodError", () => {
  it("too_small with minimum 1 → 'nonempty' translation", () => {
    expect(prettifyZodError(issue(), "sign-in")).toBe("User is required");
  });

  it("too_small with minimum > 1 is NOT treated as nonempty", () => {
    addTranslations({ ns: { a: { too_small: "Too short" } } });
    expect(prettifyZodError(issue({ minimum: 2, path: ["a"] }), "ns")).toBe(
      "Too short",
    );
  });

  it("drops numeric path segments", () => {
    const res = prettifyZodError(
      issue({ path: ["book", "fields", 0, "name"] }),
      "create-book",
    );
    expect(res).toBe("Property name is required");
    expect(res).not.toContain(".0.");
  });

  it("code 'custom' → issue.message is the last key segment", () => {
    addTranslations({ ns: { a: { boom: "Custom text" } } });
    expect(
      prettifyZodError(
        issue({ code: "custom", path: ["a"], message: "boom" }),
        "ns",
      ),
    ).toBe("Custom text");
  });

  it("other codes → issue.code is the last key segment", () => {
    addTranslations({ ns: { a: { invalid_type: "Wrong type" } } });
    expect(
      prettifyZodError(issue({ code: "invalid_type", path: ["a"] }), "ns"),
    ).toBe("Wrong type");
  });

  it("empty namespace → key without an empty segment", () => {
    const res = prettifyZodError(
      issue({ code: "invalid_type", path: ["a"] }),
      "",
    );
    expect(res).toBe("a.invalid_type");
  });

  it("empty path → key is namespace + code only", () => {
    const res = prettifyZodError(
      issue({ code: "invalid_type", path: [] }),
      "ns",
    );
    expect(res).toBe("ns.invalid_type");
  });

  it("missing translation → returns the key string, does not throw", () => {
    const res = prettifyZodError(issue({ path: ["nope"] }), "unknown-ns");
    expect(typeof res).toBe("string");
    expect(res).toBe("unknown-ns.nope.nonempty");
  });

  it("passes the rest of the issue as interpolation variables", () => {
    addTranslations({
      ns: { a: { too_small: "Min {{minimum}} ({{origin}})" } },
    });
    expect(prettifyZodError(issue({ minimum: 3, path: ["a"] }), "ns")).toBe(
      "Min 3 (string)",
    );
  });

  it("every create-book validation error has a translation", () => {
    const r = CreateBookSchema.safeParse({
      user: "",
      book: {
        id: "",
        name: "",
        author: "",
        fields: [{ id: "f", name: "", value: "" }],
      },
    });
    expect(r.error!.issues.length).toBeGreaterThan(0);
    for (const i of r.error!.issues) {
      expect(prettifyZodError(i, "create-book")).not.toMatch(/^create-book\./);
    }
  });
});
