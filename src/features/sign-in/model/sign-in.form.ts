import { useMutation } from "@tanstack/react-query";
import {
  createElement,
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SignInMutation } from "../../../entities/user/mutations/sign-in.mutation";
import { SignInSchema } from "../../../entities/user/schemas/sign-in.schema";
import { useAppForm } from "../../../shared/form/model/form.model";
import { InitialSignInState } from "./sign-in.state";

export const useSignInForm = () => {
  const [open, setOpen] = useState(false);
  const SignIn = useMutation(SignInMutation);

  const form = useAppForm({
    formId: "sign-in",
    defaultValues: InitialSignInState,
    validators: { onChange: SignInSchema },
    onSubmit: async ({ value }) => {
      await SignIn.mutateAsync(value.user);
      setOpen(false);
    },
  });

  const Wrapper = useMemo<FC<PropsWithChildren>>(() => {
    return ({ children, ...props }) =>
      createElement(form.Wrapper, { ...props, form }, children);
  }, [form]);

  useEffect(() => {
    form.reset();
  }, [open]);

  return {
    form: { form, Wrapper },
    modal: { open, setOpen },
  };
};
