import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAxiosError } from "../../../testing/utils/make-axios-error";
import { normalizeAxiosError } from "../axios/normalize-axios-error";
import { shouldLogAxios } from "../axios/should-log-axios";

vi.mock("../axios/should-log-axios", () => ({ shouldLogAxios: vi.fn() }));

describe("normalizeAxiosError", () => {
  beforeEach(() => {
    vi.mocked(shouldLogAxios).mockReturnValue(true);
  });

  describe("non-axios errors", () => {
    it.each([
      ["Error", new Error("x")],
      ["plain object", { message: "x" }],
      ["string", "x"],
      ["undefined", undefined],
      ["null", null],
    ])("%s → null", (_name, value) => {
      expect(normalizeAxiosError(value, {})).toBeNull();
    });
  });

  describe("message and details", () => {
    it("detail as string → message = detail, details undefined", () => {
      const res = normalizeAxiosError(
        makeAxiosError({ status: 404, data: { detail: "Not found" } }),
        {},
      )!;

      expect(res.message).toBe("Not found");
      expect(res.details).toBeUndefined();
    });

    it("detail as array → details = array, message from error.message", () => {
      const detail = [
        { loc: ["body", "name"], msg: "required", type: "missing" },
      ];

      const res = normalizeAxiosError(
        makeAxiosError({ status: 422, data: { detail } }),
        { a: 1 },
      )!;

      expect(res.details).toEqual(detail);
      expect(res.message).toBe("request_failed_with_status_code_422");
    });

    it('detail missing → message is lowercased error.message with spaces replaced by "_"', () => {
      const res = normalizeAxiosError(
        makeAxiosError({ status: 500, data: {} }),
        {},
      )!;

      expect(res.message).toBe("request_failed_with_status_code_500");
      expect(res.details).toBeUndefined();
    });

    it("no response → message is normalized error.message", () => {
      const res = normalizeAxiosError(
        makeAxiosError({ message: "Network Error" }),
        {},
      )!;

      expect(res.message).toBe("network_error");
      expect(res.details).toBeUndefined();
    });

    it('known limitation: detail null → details === null (typeof null is "object")', () => {
      const res = normalizeAxiosError(
        makeAxiosError({ status: 500, data: { detail: null } }),
        {},
      )!;

      expect(res.details).toBeNull();
      expect(res.message).toBe("request_failed_with_status_code_500");
    });
  });

  describe("logExtra", () => {
    it("contains url, method, status and payload", () => {
      const payload = { a: 1 };

      const res = normalizeAxiosError(
        makeAxiosError({ status: 422, data: { detail: "bad" } }),
        payload,
      )!;

      expect(res.logExtra).toMatchObject({
        url: "/x",
        method: "get",
        status: 422,
        payload: { a: 1 },
      });
      expect(res.logExtra.payload).toBe(payload);
    });

    it("no response → status is undefined", () => {
      const res = normalizeAxiosError(
        makeAxiosError({ message: "Network Error" }),
        {},
      )!;

      expect(res.logExtra.status).toBeUndefined();
    });

    it("contains serialized axios error", () => {
      const res = normalizeAxiosError(
        makeAxiosError({ status: 500, data: {} }),
        {},
      )!;

      expect(res.logExtra.error).toMatchObject({ status: 500 });
    });
  });

  describe("shouldLog", () => {
    it.each([true, false])(
      "delegates to shouldLogAxios (returns %s)",
      (value) => {
        vi.mocked(shouldLogAxios).mockReturnValue(value);
        const error = makeAxiosError({ status: 500, data: {} });

        const res = normalizeAxiosError(error, {})!;

        expect(shouldLogAxios).toHaveBeenCalledWith(error);
        expect(res.shouldLog).toBe(value);
      },
    );
  });
});
