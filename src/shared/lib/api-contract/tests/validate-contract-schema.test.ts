import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateContractSchema } from "../validation/validate-contract-schema";

const catchError = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected function to throw");
};

describe("validateContractSchema", () => {
  it("valid data → returns parsed data", () => {
    const schema = z.object({ name: z.string() });

    expect(validateContractSchema(schema, { name: "Dune" })).toEqual({
      name: "Dune",
    });
  });

  it("invalid data → throws ZodError", () => {
    const schema = z.object({ n: z.number() });

    expect(() => validateContractSchema(schema, { n: "x" })).toThrow(
      z.ZodError,
    );
    expect(
      catchError(() => validateContractSchema(schema, { n: "x" })),
    ).toBeInstanceOf(z.ZodError);
  });

  it("schema with coerce → returns transformed output, not input", () => {
    const schema = z.object({ n: z.coerce.number() });

    expect(validateContractSchema(schema, { n: "5" })).toEqual({ n: 5 });
  });

  it("schema with default → applies default value", () => {
    const schema = z.object({ role: z.string().default("reader") });

    expect(validateContractSchema(schema, {})).toEqual({ role: "reader" });
  });

  it("schema with transform → returns transformed value", () => {
    const schema = z.object({
      name: z.string().transform((s) => s.toUpperCase()),
    });

    expect(validateContractSchema(schema, { name: "dune" })).toEqual({
      name: "DUNE",
    });
  });

  it("invalid data → ZodError issue contains the offending input (reportInput: true)", () => {
    const schema = z.object({ n: z.number() });

    const error = catchError(() =>
      validateContractSchema(schema, { n: "x" }),
    ) as z.ZodError;

    expect(error.issues).toHaveLength(1);
    expect(error.issues[0]).toHaveProperty("input", "x");
  });
});
