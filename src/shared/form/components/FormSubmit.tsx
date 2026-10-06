import { Button } from "@radix-ui/themes";
import type { PropsWithChildren } from "react";
import { getSubmittingState } from "../lib/get-submitting-state";
import { useFormContext } from "../model/form.model";

export function FormSubmit({ children }: PropsWithChildren) {
  const form = useFormContext();
  return (
    <form.Subscribe>
      {(state) => {
        const { submitting, disabled } = getSubmittingState(state);
        return (
          <Button loading={submitting} disabled={disabled}>
            {children}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
