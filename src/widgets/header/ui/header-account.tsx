import { ExitIcon } from "@radix-ui/react-icons";
import { Flex, IconButton, Separator, Skeleton, Text } from "@radix-ui/themes";
import { FC } from "react";
import { useHeaderAccountController } from "../model/header-account.controller";

export const HeaderAccount: FC = () => {
  const { user, count, loading, onExit } = useHeaderAccountController();

  return (
    <Flex align={"center"} gap={"4"}>
      <Flex direction={"column"}>
        <Text weight={"bold"}>{user}</Text>
        <Text size={"1"}>
          Your Books:{" "}
          <Skeleton loading={loading}>
            <Text>{count}</Text>
          </Skeleton>
        </Text>
      </Flex>
      <Separator orientation={"vertical"} size={"2"} />
      <IconButton variant={"soft"} onClick={onExit} size={"3"}>
        <ExitIcon />
      </IconButton>
    </Flex>
  );
};
