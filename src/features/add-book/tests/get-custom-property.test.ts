import { describe, expect, it } from "vitest";
import { getCustomProperty } from "../lib/get-custom-property";

describe("getCustomProperty", () => {
  it("returns { id, name: '', value: '' }", () => {
    expect(getCustomProperty()).toEqual({
      id: expect.any(String),
      name: "",
      value: "",
    });
  });

  it("id has 8 characters", () => {
    expect(getCustomProperty().id).toMatch(/^[0-9a-zA-Z]{8}$/);
  });

  it("each call returns a new object with a new id", () => {
    const a = getCustomProperty();
    const b = getCustomProperty();
    expect(a).not.toBe(b);
    expect(a.id).not.toBe(b.id);
  });

  it("mutating one result does not affect another", () => {
    const a = getCustomProperty();
    const b = getCustomProperty();
    a.name = "year";
    expect(b.name).toBe("");
  });
});
