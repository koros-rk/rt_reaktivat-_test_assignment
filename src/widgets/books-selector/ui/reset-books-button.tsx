import { Button } from "@radix-ui/themes";
import { FC } from "react";
import { useResetBooksController } from "../model/books-reset.controller";

export const ResetBooksButton: FC = () => {
  const { reset, label, isPending } = useResetBooksController();
  return (
    <Button
      color="red"
      variant="soft"
      style={{ width: "50%" }}
      loading={isPending}
      onClick={reset}
    >
      {label}
    </Button>
  );
};
