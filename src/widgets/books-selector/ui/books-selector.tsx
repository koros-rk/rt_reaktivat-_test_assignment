import { Button, Flex, Separator } from "@radix-ui/themes";
import { FC } from "react";
import { CreateBookModal } from "../../../features/add-book/ui/create-book-modal";
import { BookListMode } from "../model/books-mode-storage.interface";
import { BooksSelectorButton } from "./books-selector-button";
import { ResetBooksButton } from "./reset-books-button";

export const BooksSelector: FC = () => {
  return (
    <Flex
      position={"sticky"}
      alignSelf={"start"}
      top={"104px"}
      gap="4"
      width="20%"
      direction="column"
    >
      <BooksSelectorButton target={BookListMode.all}>
        All Books
      </BooksSelectorButton>
      <BooksSelectorButton target={BookListMode.private}>
        Private Books
      </BooksSelectorButton>
      <Separator size="4" />
      <Flex width={"100%"} gap="2">
        <ResetBooksButton />
        <CreateBookModal>
          <Button style={{ flexGrow: "1" }}>Add Book</Button>
        </CreateBookModal>
      </Flex>
    </Flex>
  );
};
