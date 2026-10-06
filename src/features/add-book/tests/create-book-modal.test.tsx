import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { installRadixPolyfills } from "../../../shared/testing/utils/radix-polyfills";
import { wrapper } from "../../../shared/testing/utils/test-utils";
import { CreateBookModal } from "../ui/create-book-modal";

beforeAll(installRadixPolyfills);

describe("CreateBookModal", () => {
  const openModal = () => {
    const view = render(
      <Theme>
        <CreateBookModal>
          <button>Add Book</button>
        </CreateBookModal>
      </Theme>,
      { wrapper },
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Book" }));
    return view;
  };

  it("trigger opens the form and Save follows its validity", async () => {
    openModal();

    const title = await screen.findByPlaceholderText("Title");
    const author = screen.getByPlaceholderText("Author");
    const save = screen.getByRole("button", { name: "Save" });
    expect(document.body.contains(title)).toBe(true);
    expect(document.body.contains(author)).toBe(true);
    expect((save as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(title, { target: { value: "Dune" } });
    fireEvent.change(author, { target: { value: "Herbert" } });

    await waitFor(() =>
      expect((save as HTMLButtonElement).disabled).toBe(false),
    );
  });

  it("removing the middle property preserves the neighbouring inputs", async () => {
    openModal();
    await screen.findByPlaceholderText("Title");
    const add = screen.getByRole("button", { name: /add new property/i });
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(add);

    const names = screen.getAllByPlaceholderText("Property name");
    fireEvent.change(names[0], { target: { value: "first" } });
    fireEvent.change(names[1], { target: { value: "middle" } });
    fireEvent.change(names[2], { target: { value: "last" } });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Remove property" })[1],
    );

    expect(
      screen
        .getAllByPlaceholderText("Property name")
        .map((input) => (input as HTMLInputElement).value),
    ).toEqual(["first", "last"]);
  });
});
