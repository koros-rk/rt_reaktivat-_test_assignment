import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { queryClient } from "../../../shared/api/query-client";
import { api } from "../../../shared/testing/utils/api";
import { seedBooks } from "../../../shared/testing/utils/books-cache";
import {
  renderController,
  signIn,
} from "../../../shared/testing/utils/test-utils";
import { getCustomProperty } from "../lib/get-custom-property";
import * as shortId from "../lib/get-short-id";
import { useCreateBookForm } from "../model/create-book.form";

type CustomField = { id: string; name: string; value: string };
type FormApi = ReturnType<typeof useCreateBookForm>["form"]["form"];

const fill = async (
  form: FormApi,
  {
    name = "Dune",
    author = "Herbert",
    fields = [] as CustomField[],
  }: { name?: string; author?: string; fields?: CustomField[] } = {},
) => {
  await act(async () => {
    form.setFieldValue("book.name", name);
    form.setFieldValue("book.author", author);
    for (const field of fields) form.pushFieldValue("book.fields", field);
  });
  await waitFor(() => expect(form.state.canSubmit).toBe(true));
};

describe("useCreateBookForm", () => {
  beforeEach(() => signIn("alice"));
  afterEach(() => vi.restoreAllMocks());

  it("initial state → user, generated id, empty book fields, and form id", () => {
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;
    const values = form.state.values;

    expect(form.formId).toBe("create-book");
    expect(values.user).toBe("alice");
    expect(values.book.id).toHaveLength(8);
    expect(values.book.name).toBe("");
    expect(values.book.author).toBe("");
    expect(values.book.fields).toEqual([]);
  });

  it("initial book id → generated only once across rerenders", () => {
    const spy = vi.spyOn(shortId, "getShortId");
    const { rerender } = renderController(() => useCreateBookForm());

    rerender();
    rerender();
    rerender();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("pushFieldValue → creates custom properties with distinct ids", async () => {
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;

    await act(async () => {
      form.pushFieldValue("book.fields", getCustomProperty());
      form.pushFieldValue("book.fields", getCustomProperty());
      await Promise.resolve();
    });

    expect(form.state.values.book.fields).toHaveLength(2);
    expect(
      new Set(form.state.values.book.fields.map(({ id }) => id)).size,
    ).toBe(2);
  });

  it("removeFieldValue(index) → removes the property at that position", async () => {
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;
    const fields = [
      { id: "f1", name: "first", value: "1" },
      { id: "f2", name: "middle", value: "2" },
      { id: "f3", name: "last", value: "3" },
    ];

    await act(async () => {
      fields.forEach((field) => form.pushFieldValue("book.fields", field));
      await Promise.resolve();
    });
    await act(async () => {
      form.removeFieldValue("book.fields", 1);
      await Promise.resolve();
    });

    expect(form.state.values.book.fields).toEqual([fields[0], fields[2]]);
  });

  it.each([
    ["book.name", ""],
    ["book.author", ""],
  ] as const)("empty %s → cannot submit", async (field, value) => {
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;
    await fill(form);

    await act(async () => form.setFieldValue(field, value));
    await waitFor(() => expect(form.state.canSubmit).toBe(false));
  });

  it.each([
    [{ id: "f1", name: "", value: "1965" }],
    [{ id: "f1", name: "year", value: "" }],
  ])("empty custom property value → cannot submit", async (field) => {
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;

    await act(async () => {
      form.setFieldValue("book.name", "Dune");
      form.setFieldValue("book.author", "Herbert");
      form.pushFieldValue("book.fields", field);
    });

    await waitFor(() => expect(form.state.canSubmit).toBe(false));
  });

  it.each([
    { fields: [] },
    { fields: [{ id: "f1", name: "year", value: "1965" }] },
  ])(
    "valid data with custom properties $fields → can submit",
    async ({ fields }) => {
      const { result } = renderController(() => useCreateBookForm());
      await fill(result.current.form.form, { fields });
      expect(result.current.form.form.state.canSubmit).toBe(true);
    },
  );

  it("valid submit → posts a flattened book and closes modal", async () => {
    api.post.mockResolvedValue({ data: { status: "ok" } });
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;
    await fill(form, {
      fields: [{ id: "f1", name: "year", value: "1965" }],
    });

    await act(async () => form.handleSubmit());

    expect(api.post).toHaveBeenCalledWith(
      "/books/alice",
      expect.objectContaining({
        name: "Dune",
        author: "Herbert",
        ownerId: "alice",
        year: "1965",
      }),
    );
    expect(result.current.modal.open).toBe(false);
  });

  it("successful submit → updates public and private book caches", async () => {
    api.post.mockResolvedValue({ data: { status: "ok" } });
    seedBooks("alice", [], []);
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;
    await fill(form);

    await act(async () => form.handleSubmit());

    for (const isPrivate of [false, true]) {
      expect(
        queryClient.getQueryData(["books", { user: "alice", isPrivate }]),
      ).toEqual([expect.objectContaining({ name: "Dune", ownerId: "alice" })]);
    }
  });

  it("successful submit → resets fields and generates a fresh id", async () => {
    api.post.mockResolvedValue({ data: { status: "ok" } });
    const { result } = renderController(() => useCreateBookForm());
    const form = result.current.form.form;
    const originalId = form.state.values.book.id;
    await fill(form);

    await act(async () => form.handleSubmit());

    expect(form.state.values.book.name).toBe("");
    expect(form.state.values.book.fields).toEqual([]);
    expect(form.state.values.book.id).not.toBe(originalId);
  });
});
