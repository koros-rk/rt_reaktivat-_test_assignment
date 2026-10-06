import { Flex } from "@radix-ui/themes";
import { withForm } from "../../../shared/form/model/form.model";
import { InitialCreateBookState } from "../model/create-book.state";

export const ModalBaseFields = withForm({
  defaultValues: InitialCreateBookState,
  render: function Component({ form }) {
    return (
      <Flex gap="4" mt="6" direction={"column"}>
        <form.AppField name={"book.name"}>
          {(field) => <field.InputField label={"Title"} />}
        </form.AppField>
        <form.AppField name={"book.author"}>
          {(field) => <field.InputField label={"Author"} />}
        </form.AppField>
      </Flex>
    );
  },
});
