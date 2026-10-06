import { describe, expect, it } from "vitest";
import { makeAxiosError } from "../../testing/utils/make-axios-error";
import { normalizeAxiosError } from "../api-contract/axios/normalize-axios-error";
import enNotification from "./translations/en/notification.json";
import enValidation from "./translations/en/validation.json";

const leaves = (node: unknown, path: string[] = []): [string, unknown][] =>
  node !== null && typeof node === "object"
    ? Object.entries(node).flatMap(([k, v]) => leaves(v, [...path, k]))
    : [[path.join("."), node]];

describe("translations (en)", () => {
  it.each(["network_error", "unknown"])(
    "notification.json has key '%s'",
    (key) => {
      expect(enNotification).toHaveProperty(key);
    },
  );

  it("normalizeAxiosError network message exists in notification.json", () => {
    const err = makeAxiosError({
      message: "Network Error",
      code: "ERR_NETWORK",
    });
    const { message } = normalizeAxiosError(err, {})!;
    expect(message).toBe("network_error");
    expect(enNotification).toHaveProperty(message);
  });

  it.each([
    ["notification", enNotification],
    ["validation", enValidation],
  ])("%s.json: every value is a non-empty string", (_, json) => {
    const entries = leaves(json);
    expect(entries.length).toBeGreaterThan(0);
    for (const [path, value] of entries) {
      expect(typeof value, path).toBe("string");
      expect((value as string).trim().length, path).toBeGreaterThan(0);
    }
  });
});
