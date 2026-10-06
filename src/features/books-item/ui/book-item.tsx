import { Badge, Card, Flex, Skeleton, Text } from "@radix-ui/themes";
import { FC } from "react";
import { Book } from "../../../entities/books/schemas/book.schema";
import { useBookItemController } from "../model/book-item.controller";

interface Props {
  index: number;
  book: Book;
}

export const BookItem: FC<Props> = ({ index, book }) => {
  const { isPlaceholder } = useBookItemController(book, index);

  return (
    <Skeleton loading={isPlaceholder}>
      <Card>
        <Flex direction={"column"} gap={"2"}>
          <Flex gap={"2"} align={"center"}>
            <Badge>#{book.id}</Badge>
            <Text size={"6"}>{book.name}</Text>
          </Flex>
          <Text size={"2"} color={"gray"}>
            {JSON.stringify(book)}
          </Text>
        </Flex>
      </Card>
    </Skeleton>
  );
};
