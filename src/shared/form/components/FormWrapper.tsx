import { Flex, FlexProps } from "@radix-ui/themes";
import { Form } from "radix-ui";
import { ComponentType, PropsWithChildren } from "react";

type FormLike = {
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

export function FormWrapper({
  children,
  form,
  onReset,
  ...rest
}: FormWrapperProps) {
  return (
    <Form.Form
      onReset={(e) => {
        e.preventDefault();
        if (onReset) {
          onReset();
        } else {
          form.reset();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        void Promise.resolve()
          .then(() => form.handleSubmit())
          .catch(() => {});
      }}
      style={{ height: "100%", width: "100%" }}
    >
      <form.AppForm>
        <Flex direction="column" {...rest}>
          {children}
        </Flex>
      </form.AppForm>
    </Form.Form>
  );
}
