export const getSubmittingState = (state: {
  isValidating: boolean;
  isFormValidating: boolean;
  isFieldsValidating: boolean;
  isDefaultValue: boolean;
  isSubmitting: boolean;
  isPristine: boolean;
  isValid: boolean;
}) => {
  const validating =
    state.isValidating || state.isFormValidating || state.isFieldsValidating;
  const disabled =
    state.isPristine || !state.isValid || validating || state.isDefaultValue;

  return { validating, disabled, submitting: state.isSubmitting };
};
