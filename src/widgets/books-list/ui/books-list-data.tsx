import { Flex } from "@radix-ui/themes";
import { FC } from "react";
import { Book } from "../../../entities/books/schemas/book.schema";
import { BookItem } from "../../../features/books-item/ui/book-item";

interface Props {
  items: Book[];
}

export const BooksListData: FC<Props> = ({ items }) => {
  return (
    <Flex direction={"column"} gap={"4"} width={"100%"}>
      {items.map((book, index) => (
        <BookItem key={book.id} index={index} book={book} />
      ))}
    </Flex>
  );
};
