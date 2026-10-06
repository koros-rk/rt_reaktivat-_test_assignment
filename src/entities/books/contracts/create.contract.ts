import { apiClient } from "../../../shared/api/api-client";
import { createApiContract } from "../../../shared/lib/api-contract/create-api-contract";
import {
  CreateBookRequestSchema,
  CreateBookResponseSchema,
} from "../schemas/create.schema";

export const CreateBookContract = createApiContract({
  in: CreateBookRequestSchema,
  out: CreateBookResponseSchema,
  action: async ({ user, book }) => {
    const url_user = encodeURIComponent(user);
    const response = await apiClient.post(`/books/${url_user}`, book);
    return response.data;
  },
});
