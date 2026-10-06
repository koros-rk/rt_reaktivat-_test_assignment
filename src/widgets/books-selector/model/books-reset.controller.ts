import { useMutation } from "@tanstack/react-query";
import { ResetBookMutation } from "../../../entities/books/mutations/reset.mutation";
import { useRequiredUserStorage } from "../../../entities/user/storage/user-storage.repository";

export const useResetBooksController = () => {
  const user = useRequiredUserStorage();

  const { mutate, isPending } = useMutation(ResetBookMutation);

  return {
    reset: () => mutate(user),
    label: isPending ? "Resetting…" : "Reset",
    isPending,
  };
};
