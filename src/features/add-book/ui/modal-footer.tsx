import { Button, Dialog, Flex } from "@radix-ui/themes";
import { withForm } from "../../../shared/form/model/form.model";
import { InitialCreateBookState } from "../model/create-book.state";

export const ModalFooter = withForm({
  defaultValues: InitialCreateBookState,
  render: function Component({ form }) {
    return (
      <Flex gap="2" mt="6" justify="end">
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
