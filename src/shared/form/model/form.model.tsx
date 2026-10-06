import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormLoader } from "../components/FormLoader";
import { FormSubmit } from "../components/FormSubmit";
import { FormWrapper } from "../components/FormWrapper";
import { FormInputField } from "../fields/form-input-field/form-input-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    InputField: FormInputField,
  },
  formComponents: {
    Submit: FormSubmit,
    Loader: FormLoader,
    Wrapper: FormWrapper,
  },
  fieldContext,
  formContext,
});
