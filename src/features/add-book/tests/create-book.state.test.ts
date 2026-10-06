import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { signIn } from "../../../shared/testing/utils/test-utils";
import {
  InitialCreateBookState,
  useInitialCreateBookState,
} from "../model/create-book.state";

const render = () => renderHook(() => useInitialCreateBookState());

describe("useInitialCreateBookState", () => {
  it("takes user from UserStorage", () => {
    signIn("alice");
    expect(render().result.current.user).toBe("alice");
  });

  it("no user → empty string", () => {
    UserStorage.setState({ user: null });
    expect(render().result.current.user).toBe("");
  });

  it("book has an 8-char id", () => {
    expect(render().result.current.book.id).toMatch(/^[0-9a-zA-Z]{8}$/);
  });

  it("book id differs between mounts", () => {
    expect(render().result.current.book.id).not.toBe(
      render().result.current.book.id,
    );
  });

  it("name and author are empty, fields is an empty array", () => {
    const { book } = render().result.current;
    expect(book).toMatchObject({ name: "", author: "", fields: [] });
  });

  it("state is stable across re-renders (lazy useState)", () => {
    signIn("alice");
    const { result, rerender } = render();
    const first = result.current;
    signIn("bob"); // зміна стору не повинна перегенерувати початковий стан
    rerender();
    expect(result.current).toBe(first);
    expect(result.current.user).toBe("alice");
  });

  it("InitialCreateBookState constant is not changed by calls", () => {
    signIn("alice");
    render();
    render();
    expect(InitialCreateBookState).toEqual({
      user: "",
      book: { id: "", name: "", author: "", fields: [] },
    });
  });

  it("does not share the fields array between calls", () => {
    const a = render().result.current;
    const b = render().result.current;
    expect(a.book.fields).not.toBe(b.book.fields);
    expect(a.book.fields).not.toBe(InitialCreateBookState.book.fields);
  });
});
