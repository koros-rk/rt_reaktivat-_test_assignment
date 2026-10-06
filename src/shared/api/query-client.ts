import { QueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

export const queryClient = new QueryClient({});
window.__TANSTACK_QUERY_CLIENT__ = queryClient;
