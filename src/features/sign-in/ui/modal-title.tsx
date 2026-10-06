import { Cross1Icon } from "@radix-ui/react-icons";
import { Dialog, Flex, IconButton } from "@radix-ui/themes";

export const ModalTitle = () => {
  return (
    <Flex mb={"4"} align={"center"} justify={"between"}>
      <Dialog.Title mb={"0"}>Enter your user</Dialog.Title>
      <Dialog.Close>
        <IconButton size={"1"} variant={"ghost"}>
          <Cross1Icon />
        </IconButton>
      </Dialog.Close>
    </Flex>
  );
};
