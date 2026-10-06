import { describe, expect, it, vi } from "vitest";
import { makeAxiosError } from "../../../testing/utils/make-axios-error";
import { shouldLogAxios } from "../axios/should-log-axios";

describe("shouldLogAxios", () => {
  describe("no response status", () => {
    it.each([
      ["code ERR_NETWORK", { code: "ERR_NETWORK" }, false],
      ["code ECONNABORTED", { code: "ECONNABORTED" }, false],
      [
        'message "Network Error"',
        { code: "ERR_CANCELED", message: "Network Error" },
        false,
      ],
      ["other code ERR_CANCELED", { code: "ERR_CANCELED" }, true],
    ])("%s → %s", (_name, input, expected) => {
      expect(shouldLogAxios(makeAxiosError(input))).toBe(expected);
    });

    it("browser offline → false", () => {
      vi.stubGlobal("navigator", { onLine: false });

      expect(shouldLogAxios(makeAxiosError({ code: "ERR_CANCELED" }))).toBe(
        false,
      );
    });

    it("browser online → true for unrelated error code", () => {
      vi.stubGlobal("navigator", { onLine: true });

      expect(shouldLogAxios(makeAxiosError({ code: "ERR_CANCELED" }))).toBe(
        true,
      );
    });
  });

  describe("with response status", () => {
    it.each([400, 401, 403, 404])("client error %i → false", (status) => {
      expect(shouldLogAxios(makeAxiosError({ status }))).toBe(false);
    });

    it.each([502, 503, 504])("gateway error %i → false", (status) => {
      expect(shouldLogAxios(makeAxiosError({ status }))).toBe(false);
    });

    it.each([500, 501])("server error %i → true", (status) => {
      expect(shouldLogAxios(makeAxiosError({ status }))).toBe(true);
    });

    it.each([409, 422, 429])("other client error %i → true", (status) => {
      expect(shouldLogAxios(makeAxiosError({ status }))).toBe(true);
    });

    it("offline browser does not affect errors that have a status", () => {
      vi.stubGlobal("navigator", { onLine: false });

      expect(shouldLogAxios(makeAxiosError({ status: 500 }))).toBe(true);
    });
  });
});
