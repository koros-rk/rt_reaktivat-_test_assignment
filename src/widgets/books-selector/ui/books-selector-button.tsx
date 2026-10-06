import { Button } from "@radix-ui/themes";
import { FC, PropsWithChildren } from "react";
import { BookListMode } from "../model/books-mode-storage.interface";
import { useBooksSelectorButtonController } from "../model/books-selector.controller";

interface Props extends PropsWithChildren {
  target: BookListMode;
}

export const BooksSelectorButton: FC<Props> = ({ target, children }) => {
  const { variant, select, isActive } =
    useBooksSelectorButtonController(target);
  return (
    <Button variant={variant} aria-pressed={isActive} onClick={select}>
      {children}
    </Button>
  );
};
