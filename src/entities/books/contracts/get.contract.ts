import { apiClient } from "../../../shared/api/api-client";
import { createApiContract } from "../../../shared/lib/api-contract/create-api-contract";
import {
  GetBooksRequestSchema,
  GetBooksResponseSchema,
} from "../schemas/get.schema";

export const GetBooksContract = createApiContract({
  in: GetBooksRequestSchema,
  out: GetBooksResponseSchema,
  action: async ({ user, isPrivate }) => {
    const url_user = encodeURIComponent(user);
    const url = isPrivate ? `/books/${url_user}/private` : `/books/${url_user}`;
    const response = await apiClient.get(url);
    return response.data;
  },
});
