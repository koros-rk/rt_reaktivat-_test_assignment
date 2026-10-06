import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { Component, createElement, PropsWithChildren } from "react";
import { vi } from "vitest";
import { queryClient } from "../../api/query-client";

class Boundary extends Component<
  PropsWithChildren<{ onError: (error: Error) => void }>,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const renderControllerWithBoundary = <T,>(hook: () => T) => {
  const onError = vi.fn<(error: Error) => void>();

  const view = renderHook(hook, {
    wrapper: ({ children }) =>
      createElement(QueryClientProvider, {
        client: queryClient,
        children: createElement(Boundary, { onError, children }),
      }),
  });

  return { ...view, onError };
};
