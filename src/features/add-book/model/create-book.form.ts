import { useMutation } from "@tanstack/react-query";
import {
  createElement,
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CreateBookMutation } from "../../../entities/books/mutations/create.mutation";
import { useAppForm } from "../../../shared/form/model/form.model";
import { prepareBook } from "../lib/prepare-book";
import { CreateBookSchema } from "./create-book.schema";
import {
  createInitialCreateBookState,
  useInitialCreateBookState,
} from "./create-book.state";

export const useCreateBookForm = () => {
  const CreateBook = useMutation(CreateBookMutation);
  const [open, setOpen] = useState(false);

  const initialState = useInitialCreateBookState();

  const form = useAppForm({
    formId: "create-book",
    defaultValues: initialState,
    validators: { onChange: CreateBookSchema },
    onSubmit: async ({ value }) => {
      await CreateBook.mutateAsync({
        book: prepareBook(value.book, value.user),
        user: value.user,
      });
      form.reset(createInitialCreateBookState());
      setOpen(false);
    },
  });

  const Wrapper = useMemo<FC<PropsWithChildren>>(() => {
    return ({ children, ...props }) =>
      createElement(form.Wrapper, { ...props, form }, children);
  }, [form]);

  useEffect(() => {
    if (open) form.reset(createInitialCreateBookState());
  }, [form, open]);

  return {
    form: { form, Wrapper },
    modal: { open, setOpen },
  };
};
