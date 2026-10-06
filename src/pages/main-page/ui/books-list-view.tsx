import { Flex } from "@radix-ui/themes";
import { BooksList } from "../../../widgets/books-list/ui/books-list";
import { BooksSelector } from "../../../widgets/books-selector/ui/books-selector";

export const BooksListView = () => {
  return (
    <Flex height={"100%"} direction={"row"} gap={"6"}>
      <BooksSelector />
      <BooksList />
    </Flex>
  );
};
