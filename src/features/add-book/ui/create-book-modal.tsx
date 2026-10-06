import { Dialog } from "@radix-ui/themes";
import { FC, PropsWithChildren } from "react";
import { useCreateBookForm } from "../model/create-book.form";
import { ModalBaseFields } from "./modal-base-fields";
import { ModalCustomFields } from "./modal-custom-fields";
import { ModalFooter } from "./modal-footer";
import { ModalTitle } from "./modal-title";

export const CreateBookModal: FC<PropsWithChildren> = ({ children }) => {
  const { form, modal } = useCreateBookForm();

  return (
    <Dialog.Root open={modal.open} onOpenChange={modal.setOpen}>
      <Dialog.Trigger>{children}</Dialog.Trigger>

      <Dialog.Content size={"2"} maxWidth="450px">
        <form.Wrapper>
          <ModalTitle />
          <ModalBaseFields form={form.form} />
          <ModalCustomFields form={form.form} />
          <ModalFooter form={form.form} />
        </form.Wrapper>
      </Dialog.Content>
    </Dialog.Root>
  );
};
