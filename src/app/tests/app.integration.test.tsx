import {
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { enqueueSnackbar } from "notistack";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { UserStorage } from "../../entities/user/storage/user-storage.repository";
import { api } from "../../shared/testing/utils/api";
import { buildBook } from "../../shared/testing/utils/builders";
import { createFakeApi } from "../../shared/testing/utils/fake-api";
import { makeAxiosError } from "../../shared/testing/utils/make-axios-error";
import { installRadixPolyfills } from "../../shared/testing/utils/radix-polyfills";
import { App } from "../app";

const seed = {
  alice: [
    buildBook({ id: "1", name: "Dune", ownerId: "alice" }),
    buildBook({ id: "2", name: "Emma", ownerId: "alice" }),
    buildBook({ id: "3", name: "Foreign", ownerId: "carol" }),
  ],
  bob: [buildBook({ id: "9", name: "Ulysses", ownerId: "bob" })],
  "a b": [buildBook({ id: "space", name: "Encoded user", ownerId: "a b" })],
};

const renderApp = () => render(<App />);

const countText = () =>
  screen
    .getByText(/Your Books:/i)
    .textContent?.replace(/\s+/g, " ")
    .trim();

const signInViaUi = async (user = "alice") => {
  fireEvent.click(screen.getAllByRole("button", { name: /sign in/i })[0]);
  fireEvent.change(await screen.findByPlaceholderText("User"), {
    target: { value: user },
  });
  const save = screen.getByRole("button", {
    name: "Save",
  }) as HTMLButtonElement;
  await waitFor(() => expect(save.disabled).toBe(false));
  fireEvent.click(save);
  await screen.findByText(user);
};

const fillNewBook = async (
  { title, author }: { title: string; author: string },
  property?: { name: string; value: string },
) => {
  fireEvent.click(screen.getByRole("button", { name: "Add Book" }));
  fireEvent.change(await screen.findByPlaceholderText("Title"), {
    target: { value: title },
  });
  fireEvent.change(screen.getByPlaceholderText("Author"), {
    target: { value: author },
  });

  if (property) {
    fireEvent.click(screen.getByRole("button", { name: /add new property/i }));
    fireEvent.change(screen.getByPlaceholderText("Property name"), {
      target: { value: property.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Property value"), {
      target: { value: property.value },
    });
  }

  const save = screen.getByRole("button", {
    name: "Save",
  }) as HTMLButtonElement;
  await waitFor(() => expect(save.disabled).toBe(false));
  return save;
};

beforeAll(() => {
  installRadixPolyfills();
  configure({ asyncUtilTimeout: 3000 });
});

afterEach(() => vi.restoreAllMocks());

describe("App integration", () => {
  it("unauthorized user → sees sign-in prompt and makes no requests", () => {
    renderApp();

    expect(screen.getByText(/to view user books/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("sign in → browse → switch mode → add → reset → sign out", async () => {
    createFakeApi(seed);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    renderApp();

    await signInViaUi("alice");
    await screen.findByText("Dune");
    await screen.findByText("Emma");
    await screen.findByText("Foreign");
    await waitFor(() => expect(countText()).toBe("Your Books: 2"));
    expect(api.get).toHaveBeenCalledWith("/books/alice");
    expect(api.get).toHaveBeenCalledWith("/books/alice/private");

    fireEvent.click(screen.getByRole("button", { name: "Private Books" }));
    await waitFor(() => expect(screen.queryByText("Foreign")).toBeNull());
    expect(
      screen
        .getByRole("button", { name: "Private Books" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "All Books" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(screen.getByText("Dune")).toBeTruthy();
    expect(screen.getByText("Emma")).toBeTruthy();

    const save = await fillNewBook(
      { title: "Solaris", author: "Lem" },
      { name: "year", value: "1961" },
    );
    const privateGetsBefore = api.get.mock.calls.filter(([url]) =>
      url.endsWith("/private"),
    ).length;
    fireEvent.click(save);

    await screen.findByText("Solaris");
    expect(api.post).toHaveBeenCalledWith(
      "/books/alice",
      expect.objectContaining({
        name: "Solaris",
        author: "Lem",
        ownerId: "alice",
        year: "1961",
      }),
    );
    await waitFor(() => expect(countText()).toBe("Your Books: 3"));
    expect(
      api.get.mock.calls.filter(([url]) => url.endsWith("/private")),
    ).toHaveLength(privateGetsBefore);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(screen.queryByText("Solaris")).toBeNull());
    await waitFor(() => expect(countText()).toBe("Your Books: 0"));
    expect(api.put).toHaveBeenCalledWith("/books/alice/reset");

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await screen.findByText(/to view user books/i);
    expect(JSON.parse(localStorage.getItem("user-storage")!).state.user).toBe(
      null,
    );
    expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(
      /authenticated screen/,
    );
  }, 15000);

  it("GET failure → shows list error while controls remain available", async () => {
    signInViaStore("alice");
    api.get.mockRejectedValue(makeAxiosError({ status: 500 }));
    renderApp();

    expect(await screen.findByText(/unable to load books/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "All Books" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add Book" })).toBeTruthy();
    expect(countText()).toBe("Your Books: 0");
  });

  it("POST failure → keeps modal values and leaves list and count unchanged", async () => {
    createFakeApi(seed);
    signInViaStore("alice");
    api.post.mockRejectedValue(makeAxiosError({ status: 500 }));
    renderApp();
    await screen.findByText("Dune");
    await waitFor(() => expect(countText()).toBe("Your Books: 2"));

    const save = await fillNewBook({ title: "Solaris", author: "Lem" });
    fireEvent.click(save);

    await waitFor(() => expect(enqueueSnackbar).toHaveBeenCalledOnce());
    expect(screen.getByPlaceholderText("Title")).toHaveProperty(
      "value",
      "Solaris",
    );
    expect(screen.getByPlaceholderText("Author")).toHaveProperty(
      "value",
      "Lem",
    );
    expect(countText()).toBe("Your Books: 2");
    expect(screen.queryByText("Solaris")).toBeNull();
  });

  it("duplicate custom property names → disables Save until corrected", async () => {
    createFakeApi(seed);
    signInViaStore("alice");
    renderApp();
    await screen.findByText("Dune");
    fireEvent.click(screen.getByRole("button", { name: "Add Book" }));
    fireEvent.change(await screen.findByPlaceholderText("Title"), {
      target: { value: "Solaris" },
    });
    fireEvent.change(screen.getByPlaceholderText("Author"), {
      target: { value: "Lem" },
    });
    const addProperty = screen.getByRole("button", {
      name: /add new property/i,
    });
    fireEvent.click(addProperty);
    fireEvent.click(addProperty);
    const names = screen.getAllByPlaceholderText("Property name");
    const values = screen.getAllByPlaceholderText("Property value");
    fireEvent.change(names[0], { target: { value: "year" } });
    fireEvent.change(values[0], { target: { value: "1961" } });
    fireEvent.change(names[1], { target: { value: "year" } });
    fireEvent.change(values[1], { target: { value: "1962" } });
    const save = screen.getByRole("button", {
      name: "Save",
    }) as HTMLButtonElement;

    await waitFor(() => expect(save.disabled).toBe(true));
    fireEvent.change(names[1], { target: { value: "edition" } });
    await waitFor(() => expect(save.disabled).toBe(false));
  });

  it("sign out then sign in as another user → shows only that user's books", async () => {
    createFakeApi(seed);
    renderApp();
    await signInViaUi("alice");
    await screen.findByText("Dune");

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await screen.findByText(/to view user books/i);
    await signInViaUi("bob");

    await screen.findByText("Ulysses");
    expect(screen.queryByText("Dune")).toBeNull();
    expect(api.get).toHaveBeenCalledWith("/books/bob");
    expect(api.get).toHaveBeenCalledWith("/books/bob/private");
  });

  it("persisted user → rehydrates to the signed-in screen", async () => {
    createFakeApi(seed);
    localStorage.setItem(
      "user-storage",
      JSON.stringify({ state: { user: "alice" }, version: 0 }),
    );
    await UserStorage.persist.rehydrate();

    renderApp();

    await screen.findByText("Dune");
    expect(screen.getByText("alice")).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith("/books/alice");
  });

  it("user with a space → requests URL-encoded books endpoints", async () => {
    createFakeApi(seed);
    renderApp();

    await signInViaUi("a b");

    await screen.findByText("Encoded user");
    expect(api.get).toHaveBeenCalledWith("/books/a%20b");
    expect(api.get).toHaveBeenCalledWith("/books/a%20b/private");
  });
});

const signInViaStore = (user: string) => UserStorage.getState().setUser(user);
