import { useMutation } from "@tanstack/react-query";
import {
  createElement,
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CreateBookMutation } from "../../../entities/books/mutations/create.mutation";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { useAppForm } from "../../../shared/form/model/form.model";
import { prepareBook } from "../lib/prepare-book";
import { CreateBookSchema } from "./create-book.schema";
import {
  createInitialCreateBookState,
  getInitialCreateBookState,
} from "./create-book.state";

export const useCreateBookForm = () => {
  const CreateBook = useMutation(CreateBookMutation);
  const [open, setOpen] = useState(false);
  const submitting = useRef(false);

  const form = useAppForm({
    formId: "create-book",
    defaultValues: getInitialCreateBookState(),
    validators: { onChange: CreateBookSchema },
    onSubmit: async ({ value }) => {
      if (submitting.current) return;

      const user = UserStorage.getState().user;
      if (!user) return;

      submitting.current = true;
      try {
        await CreateBook.mutateAsync({
          book: prepareBook(value.book, user),
          user,
        });
        form.reset(createInitialCreateBookState());
        setOpen(false);
      } catch {
        // The mutation's onError handler reports the failure to the user.
      } finally {
        submitting.current = false;
      }
    },
  });

  const Wrapper = useMemo<FC<PropsWithChildren>>(() => {
    return ({ children, ...props }) =>
      createElement(form.Wrapper, { ...props, form }, children);
  }, [form]);

  useEffect(() => {
    if (open) form.reset(createInitialCreateBookState());
  }, [open]);

  return {
    form: { form, Wrapper },
    modal: { open, setOpen },
  };
};
