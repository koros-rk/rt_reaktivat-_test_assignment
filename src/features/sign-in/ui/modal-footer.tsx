import { Button, Dialog, Flex } from "@radix-ui/themes";
import { withForm } from "../../../shared/form/model/form.model";
import { InitialSignInState } from "../model/sign-in.state";

export const ModalFooter = withForm({
  defaultValues: InitialSignInState,
  render: function Component({ form }) {
    return (
      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>
        <form.Submit>Save</form.Submit>
      </Flex>
    );
  },
});
