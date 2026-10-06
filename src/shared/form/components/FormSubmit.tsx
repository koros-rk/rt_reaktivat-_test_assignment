import { Button } from "@radix-ui/themes";
import type { PropsWithChildren } from "react";
import { getSubmittingState } from "../lib/get-submitting-state";
import { useFormContext } from "../model/form.model";

interface Props extends PropsWithChildren {
  alwaysActive?: boolean;
}

export function FormSubmit({ children, alwaysActive, ...props }: Props) {
  const form = useFormContext();
  return (
    <form.Subscribe>
      {(state) => {
        const { submitting, disabled } = getSubmittingState(state);
        return (
          <Button loading={submitting} disabled={disabled} {...props}>
            {children}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
