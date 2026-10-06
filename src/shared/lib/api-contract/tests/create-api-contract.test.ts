import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { makeAxiosError } from "../../../testing/utils/make-axios-error";
import { createApiContract } from "../create-api-contract";

const make = (action: any) =>
  createApiContract({
    in: z.object({ id: z.coerce.number() }),
    out: z.object({ ok: z.boolean() }),
    action,
  });

describe("createApiContract", () => {
  describe("success path", () => {
    it("valid input and output → resolves with validated output", async () => {
      const action = vi.fn().mockResolvedValue({ ok: true });

      await expect(make(action)({ id: 1 })).resolves.toEqual({ ok: true });
    });

    it("output schema strips unknown keys → resolves with output, not raw result", async () => {
      const action = vi.fn().mockResolvedValue({ ok: true, extra: "x" });

      await expect(make(action)({ id: 1 })).resolves.toEqual({ ok: true });
    });

    it("coercible input → action receives validated input", async () => {
      const action = vi.fn().mockResolvedValue({ ok: true });

      await make(action)({ id: "7" } as any);

      expect(action).toHaveBeenCalledWith({ id: 7 });
    });
  });

  describe("validation errors", () => {
    it("invalid input → rejects with issues and does not call action", async () => {
      const action = vi.fn();

      await expect(make(action)({ id: "abc" } as any)).rejects.toHaveProperty(
        "issues",
      );
      expect(action).not.toHaveBeenCalled();
    });

    it("invalid input → issues is a non-empty array", async () => {
      const error = await make(vi.fn())({ id: "abc" } as any).catch((e) => e);

      expect(Array.isArray(error.issues)).toBe(true);
      expect(error.issues.length).toBeGreaterThan(0);
    });

    it("invalid output → rejects with issues", async () => {
      const action = vi.fn().mockResolvedValue({ ok: "not-a-boolean" });

      await expect(make(action)({ id: 1 })).rejects.toHaveProperty("issues");
    });
  });

  describe("axios errors", () => {
    it("404 with string detail → { message: detail, status: 404, details: undefined }", async () => {
      const err = makeAxiosError({
        status: 404,
        data: { detail: "Not found" },
      });

      await expect(
        make(vi.fn().mockRejectedValue(err))({ id: 1 }),
      ).rejects.toEqual({
        message: "Not found",
        status: 404,
        details: undefined,
      });
    });

    it("422 with array detail → details is the array, message is normalized error.message", async () => {
      const detail = [
        { loc: ["body", "name"], msg: "field required", type: "missing" },
      ];
      const err = makeAxiosError({ status: 422, data: { detail } });

      await expect(
        make(vi.fn().mockRejectedValue(err))({ id: 1 }),
      ).rejects.toEqual({
        message: "request_failed_with_status_code_422",
        status: 422,
        details: detail,
      });
    });

    it('network failure (no response) → message "network_error", status undefined', async () => {
      const err = makeAxiosError({ message: "Network Error" });

      await expect(
        make(vi.fn().mockRejectedValue(err))({ id: 1 }),
      ).rejects.toEqual({
        message: "network_error",
        status: undefined,
        details: undefined,
      });
    });

    it("500 without detail → message is normalized error.message", async () => {
      const err = makeAxiosError({ status: 500, data: {} });

      await expect(
        make(vi.fn().mockRejectedValue(err))({ id: 1 }),
      ).rejects.toMatchObject({
        message: "request_failed_with_status_code_500",
        status: 500,
      });
    });
  });

  describe("non-axios errors", () => {
    it('Error("boom") → { message: "boom" }', async () => {
      await expect(
        make(vi.fn().mockRejectedValue(new Error("boom")))({ id: 1 }),
      ).rejects.toEqual({
        message: "boom",
      });
    });

    it("thrown object with message → { message }", async () => {
      await expect(
        make(vi.fn().mockRejectedValue({ message: "x" }))({ id: 1 }),
      ).rejects.toEqual({
        message: "x",
      });
    });

    it.each([["str"], [undefined], [null]])(
      'thrown %s → { message: "unknown" }',
      async (thrown) => {
        await expect(
          make(vi.fn().mockRejectedValue(thrown))({ id: 1 }),
        ).rejects.toEqual({
          message: "unknown",
        });
      },
    );
  });

  describe("promise contract", () => {
    it("invalid input → returns a rejected promise instead of throwing synchronously", async () => {
      const contract = make(vi.fn());
      let promise: Promise<unknown> | undefined;

      expect(() => {
        promise = contract({ id: "abc" } as any);
      }).not.toThrow();

      expect(promise).toBeInstanceOf(Promise);
      await expect(promise).rejects.toHaveProperty("issues");
    });

    it("action throws synchronously → still rejects", async () => {
      const action = vi.fn().mockImplementation(() => {
        throw new Error("sync boom");
      });

      await expect(make(action)({ id: 1 })).rejects.toEqual({
        message: "sync boom",
      });
    });
  });
});
