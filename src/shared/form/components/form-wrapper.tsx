import { Flex, FlexProps } from "@radix-ui/themes";
import { Form } from "radix-ui";
import { ComponentType, PropsWithChildren } from "react";
import { getWrapperActions } from "../lib/get-wrapper-actions";

export type FormLike = {
  AppForm: ComponentType<PropsWithChildren>;
  reset: () => void;
  handleSubmit: () => void | Promise<void>;
};

export type FormWrapperProps = PropsWithChildren<
  Omit<FlexProps, "onReset" | "onSubmit"> & {
    form: FormLike;
    onReset?: () => void;
  }
>;

export function FormWrapper({ children, form, ...rest }: FormWrapperProps) {
  const { onReset, onSubmit } = getWrapperActions({ form, ...rest });

  return (
    <Form.Form
      onReset={onReset}
      onSubmit={onSubmit}
      style={{ height: "100%", width: "100%" }}
    >
      <form.AppForm>
        <Flex direction="column">{children}</Flex>
      </form.AppForm>
    </Form.Form>
  );
}
