import { enqueueSnackbar } from "notistack";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { errorHandler } from "./error-handler";

const toast = vi.mocked(enqueueSnackbar);
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

describe("errorHandler", () => {
  describe("known message codes", () => {
    it('Error("network_error") → translated error toast', () => {
      errorHandler(new Error("network_error"));

      expect(toast).toHaveBeenCalledOnce();
      expect(toast).toHaveBeenCalledWith(GENERIC_MESSAGE, { variant: "error" });
    });

    it('{ message: "network_error" } (contract format) → same translation', () => {
      errorHandler({ message: "network_error" });

      expect(toast).toHaveBeenCalledOnce();
      expect(toast).toHaveBeenCalledWith(GENERIC_MESSAGE, { variant: "error" });
    });
  });

  describe("unknown message codes", () => {
    it('{ message: "some_unknown_code" } → toast with the code itself', () => {
      errorHandler({ message: "some_unknown_code" });

      expect(toast).toHaveBeenCalledOnce();
      expect(toast).toHaveBeenCalledWith("some_unknown_code", {
        variant: "error",
      });
    });

    it("never leaks the namespace prefix", () => {
      errorHandler({ message: "weird_code" });

      expect(toast.mock.calls[0][0]).not.toContain("notification:");
    });

    it("server message (human text) → shown as is", () => {
      errorHandler({ message: "Not found", status: 404 });

      expect(toast).toHaveBeenCalledWith("Not found", { variant: "error" });
    });
  });

  describe("unrecognized formats", () => {
    it.each([[{}], [{ foo: 1 }], [{ message: "" }]])(
      '%j → toast for key "unknown"',
      (value) => {
        errorHandler(value);

        expect(toast).toHaveBeenCalledOnce();
        expect(toast).toHaveBeenCalledWith(GENERIC_MESSAGE, {
          variant: "error",
        });
      },
    );
  });

  describe("number of toasts", () => {
    it("one error → exactly one enqueueSnackbar call", () => {
      errorHandler({ message: "network_error" });

      expect(toast).toHaveBeenCalledTimes(1);
    });
  });

  describe("known bugs", () => {
    it("{ issues: [...] } (contract format) → one toast per issue", () => {
      errorHandler({ issues: [{ message: "A" }, { message: "B" }] });

      expect(toast).toHaveBeenCalledTimes(2);
      expect(toast).toHaveBeenCalledWith("A", { variant: "error" });
      expect(toast).toHaveBeenCalledWith("B", { variant: "error" });
    });

    it("real ZodError → one toast per issue", () => {
      const result = z.object({ a: z.string(), b: z.string() }).safeParse({});
      expect(result.success).toBe(false);

      errorHandler((result as { error: z.ZodError }).error);

      expect(toast).toHaveBeenCalledTimes(2);
    });

    it("undefined does not throw", () => {
      expect(() => errorHandler(undefined)).not.toThrow();
    });

    it("null does not throw", () => {
      expect(() => errorHandler(null)).not.toThrow();
    });
  });
});
