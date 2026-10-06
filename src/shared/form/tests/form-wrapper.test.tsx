import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentType, PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { FormWrapper } from "../components/FormWrapper";

const AppForm = ({ children }: PropsWithChildren) => <>{children}</>;

const renderForm = (
  overrides: Partial<{
    reset: () => void;
    handleSubmit: () => void | Promise<void>;
  }> = {},
) => {
  const form = {
    AppForm: AppForm as ComponentType<PropsWithChildren>,
    reset: vi.fn(),
    handleSubmit: vi.fn(),
    ...overrides,
  };
  const view = render(
    <FormWrapper form={form}>
      <button type="submit">Submit</button>
    </FormWrapper>,
  );

  return { ...view, form };
};

describe("FormWrapper", () => {
  it("submit → prevents browser navigation and calls handleSubmit", async () => {
    const { container, form } = renderForm();
    const event = new Event("submit", { bubbles: true, cancelable: true });

    container.querySelector("form")!.dispatchEvent(event);
    await Promise.resolve();
    await Promise.resolve();

    expect(event.defaultPrevented).toBe(true);
    expect(form.handleSubmit).toHaveBeenCalledOnce();
  });

  it("reset → resets form by default", () => {
    const { container, form } = renderForm();

    fireEvent.reset(container.querySelector("form")!);

    expect(form.reset).toHaveBeenCalledOnce();
  });

  it("custom onReset → calls only the supplied callback", () => {
    const onReset = vi.fn();
    const form = {
      AppForm: AppForm as ComponentType<PropsWithChildren>,
      reset: vi.fn(),
      handleSubmit: vi.fn(),
    };
    const { container } = render(
      <FormWrapper form={form} onReset={onReset}>
        <button type="reset">Reset</button>
      </FormWrapper>,
    );

    fireEvent.reset(container.querySelector("form")!);

    expect(onReset).toHaveBeenCalledOnce();
    expect(form.reset).not.toHaveBeenCalled();
  });

  it("rejected handleSubmit → rejection is handled", async () => {
    const { container } = renderForm({
      handleSubmit: () => Promise.reject(new Error("submit failed")),
    });

    fireEvent.submit(container.querySelector("form")!);
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
  });
});
