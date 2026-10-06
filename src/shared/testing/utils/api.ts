import { vi } from "vitest";
import { apiClient } from "../../api/api-client";

export const api = {
  get: vi.mocked(apiClient.get),
  post: vi.mocked(apiClient.post),
  put: vi.mocked(apiClient.put),
};
