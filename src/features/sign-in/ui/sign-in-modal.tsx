import { Dialog } from "@radix-ui/themes";
import { FC, PropsWithChildren } from "react";
import { useSignInForm } from "../model/sign-in.form";
import { ModalFooter } from "./modal-footer";
import { ModalTitle } from "./modal-title";

export const SignInModal: FC<PropsWithChildren> = ({ children }) => {
  const { form, modal } = useSignInForm();

  return (
    <Dialog.Root open={modal.open} onOpenChange={modal.setOpen}>
      <Dialog.Trigger>{children}</Dialog.Trigger>

      <Dialog.Content size={"2"} maxWidth="450px">
        <form.Wrapper>
          <ModalTitle />
          <form.form.AppField name={"user"}>
            {(field) => <field.InputField label={"User"} />}
          </form.form.AppField>
          <ModalFooter form={form.form} />
        </form.Wrapper>
      </Dialog.Content>
    </Dialog.Root>
  );
};
