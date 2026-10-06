import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Flex, TextField, Tooltip } from "@radix-ui/themes";
import { FC } from "react";
import { useFormInputFieldController } from "./form-input-field.controller";

export type FormTextFieldProps = TextField.RootProps & {
  label?: string;
};

export const FormInputField: FC<FormTextFieldProps> = (props) => {
  const { invalid, prepared_message, value, disabled, onChange, handleBlur } =
    useFormInputFieldController(props);

  return (
    <Flex position={"relative"} direction={"column"}>
      <TextField.Root
        {...props}
        placeholder={props.label}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        disabled={disabled}
        color={invalid ? "red" : undefined}
      >
        <TextField.Slot></TextField.Slot>
        <TextField.Slot>
          {prepared_message && (
            <Tooltip content={prepared_message}>
              <InfoCircledIcon color={"red"} />
            </Tooltip>
          )}
        </TextField.Slot>
      </TextField.Root>
    </Flex>
  );
};
