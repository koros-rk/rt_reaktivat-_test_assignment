import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton } from "@radix-ui/themes";
import { withForm } from "../../../shared/form/model/form.model";
import { getCustomProperty } from "../lib/get-custom-property";
import { InitialCreateBookState } from "../model/create-book.state";

export const ModalCustomFields = withForm({
  defaultValues: InitialCreateBookState,
  render: function Component({ form }) {
    return (
      <Flex gap="4" mt="4" direction={"column"}>
        <form.Field name="book.fields" mode="array">
          {(arrayField) => (
            <Flex direction="column" gap="3">
              {arrayField.state.value.map((prop, i) => (
                <Flex key={prop.id} gap="2" align="center">
                  <form.AppField name={`book.fields[${i}].name`}>
                    {(field) => <field.InputField label="Property name" />}
                  </form.AppField>

                  <form.AppField name={`book.fields[${i}].value`}>
                    {(field) => <field.InputField label="Property value" />}
                  </form.AppField>

                  <IconButton
                    aria-label="Remove property"
                    type="button"
                    variant="soft"
                    color="red"
                    size={"1"}
                    onClick={() => arrayField.removeValue(i)}
                  >
                    <Cross2Icon />
                  </IconButton>
                </Flex>
              ))}

              <Button
                type="button"
                variant="soft"
                onClick={() => arrayField.pushValue(getCustomProperty())}
              >
                <PlusIcon /> Add new property
              </Button>
            </Flex>
          )}
        </form.Field>
      </Flex>
    );
  },
});
