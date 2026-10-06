import { describe, expect, it } from "vitest";
import { SignInSchema } from "../../../entities/user/schemas/sign-in.schema";

describe("SignInSchema", () => {
  it("accepts a non-empty user", () => {
    expect(SignInSchema.safeParse({ user: "alice" }).success).toBe(true);
  });

  it("rejects empty user (too_small, minimum 1)", () => {
    const r = SignInSchema.safeParse({ user: "" });
    expect(r.success).toBe(false);
    expect(r.error!.issues).toHaveLength(1);
    expect(r.error!.issues[0]).toMatchObject({
      code: "too_small",
      minimum: 1,
      path: ["user"],
    });
  });

  it("rejects an empty object", () => {
    const r = SignInSchema.safeParse({});
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].path).toEqual(["user"]);
  });

  it("rejects whitespace-only user", () => {
    expect(SignInSchema.safeParse({ user: "   " }).success).toBe(false);
  });
});
