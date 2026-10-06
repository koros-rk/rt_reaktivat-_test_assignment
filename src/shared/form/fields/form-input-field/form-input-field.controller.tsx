import { ChangeEvent, useMemo } from "react";
import { prettifyZodError } from "../../../lib/prettify-zod-issue/prettify-zod-issue";
import { useFieldContext } from "../../model/form.model";

export type Props = {
  disabled?: boolean;
};

export const useFormInputFieldController = (props: Props) => {
  const field = useFieldContext<string>();
  const namespace = field.form.formId;

  const value = field.state.value;
  const { isValid, isValidating, isPristine } = field.state.meta;
  const { handleChange, handleBlur } = field;

  const invalid = !isPristine && !isValid;
  const disabled = isValidating || props.disabled;

  const prepared_message = useMemo(() => {
    if (!invalid) return null;
    const [error] = field.state.meta.errors;
    return prettifyZodError(error, namespace);
  }, [invalid, namespace, field.state.meta.errors]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value);
  };

  return {
    value,
    invalid,
    disabled,
    prepared_message,
    onChange,
    handleBlur,
  };
};
