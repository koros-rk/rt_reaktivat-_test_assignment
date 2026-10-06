import { mutationOptions } from "@tanstack/react-query";
import { queryClient } from "../../../shared/api/query-client";
import { errorHandler } from "../../../shared/lib/error-handler/error-handler";
import { ResetBooksContract } from "../contracts/reset.contract";

export const ResetBookMutation = mutationOptions({
  mutationKey: ["books", "reset"],
  mutationFn: ResetBooksContract,
  onError: errorHandler,
  onSuccess: async () => {
    const key = ["books"];
    await queryClient.invalidateQueries({
      refetchType: "active",
      queryKey: key,
      exact: false,
    });
  },
});
