import { Flex } from "@radix-ui/themes";
import { FC } from "react";
import { useBooksListController } from "../model/books-list.controller";
import { BooksListData } from "./books-list-data";
import { BooksListError } from "./books-list-error";

const screens = {
  error: BooksListError,
  success: BooksListData,
  pending: BooksListData,
};

export const BooksList: FC = () => {
  const { books, status } = useBooksListController();
  const Screen = screens[status];

  return (
    <Flex width={"80%"} position={"relative"}>
      <Screen items={books} />
    </Flex>
  );
};
