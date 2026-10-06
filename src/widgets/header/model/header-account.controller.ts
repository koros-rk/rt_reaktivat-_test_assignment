import { useMutation, useQuery } from "@tanstack/react-query";
import { GetBooksQuery } from "../../../entities/books/queries/get.query";
import { SignOutMutation } from "../../../entities/user/mutations/sign-out.mutation";
import { useRequiredUserStorage } from "../../../entities/user/storage/user-storage.repository";

export const useHeaderAccountController = () => {
  const { user } = useRequiredUserStorage();

  const { mutate } = useMutation(SignOutMutation);

  const PrivateBooks = useQuery({
    ...GetBooksQuery({ user, isPrivate: true }),
    select: (data) => data.length,
    initialData: [],
  });

  return {
    user,
    count: PrivateBooks.data,
    loading: PrivateBooks.isPending,
    onExit: () => mutate(),
  };
};
