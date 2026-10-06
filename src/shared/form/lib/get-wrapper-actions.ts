import { SyntheticEvent } from "react";
import { FormLike } from "../components/form-wrapper";

export const getWrapperActions = (state: {
  form: FormLike;
  onReset?: () => void;
}) => {
  const onReset = (e: SyntheticEvent) => {
    e.preventDefault();
    if (state.onReset) state.onReset();
    else state.form.reset();
  };

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    void Promise.resolve()
      .then(() => state.form.handleSubmit())
      .catch(() => {});
  };

  return { onReset, onSubmit };
};
