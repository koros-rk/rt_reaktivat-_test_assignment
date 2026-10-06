import { Flex, Text } from "@radix-ui/themes";
import { FC } from "react";

export const BooksListError: FC = () => {
  return (
    <Flex width={"100%"} height={"100%"} align={"center"} justify={"center"}>
      <Text color={"red"} size={"3"}>
        Unable to load books... Please try again later
      </Text>
    </Flex>
  );
};
