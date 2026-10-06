import { apiClient } from "../../../shared/api/api-client";
import { createApiContract } from "../../../shared/lib/api-contract/create-api-contract";
import {
  ResetBooksRequestSchema,
  ResetBooksResponseSchema,
} from "../schemas/reset.schema";

export const ResetBooksContract = createApiContract({
  in: ResetBooksRequestSchema,
  out: ResetBooksResponseSchema,
  action: async ({ user }) => {
    const url_user = encodeURIComponent(user);
    const response = await apiClient.put(`/books/${url_user}/reset`);
    return response.data;
  },
});
