import { mutationOptions } from "@tanstack/react-query";
import { queryClient } from "../../../shared/api/query-client";
import { errorHandler } from "../../../shared/lib/error-handler/error-handler";
import { CreateBookContract } from "../contracts/create.contract";
import { Book } from "../schemas/book.schema";

export const CreateBookMutation = mutationOptions({
  mutationKey: ["books", "create"],
  mutationFn: CreateBookContract,
  onError: errorHandler,
  onSuccess: async (_, payload) => {
    const key = ["books", { user: payload.user, isPrivate: false }];
    const key_private = ["books", { user: payload.user, isPrivate: true }];

    const updater = (slice: Book[] | undefined) => {
      if (!slice) return [payload.book];
      return [...slice, payload.book];
    };

    await queryClient.setQueryData(key, updater);
    await queryClient.setQueryData(key_private, updater);
  },
});
