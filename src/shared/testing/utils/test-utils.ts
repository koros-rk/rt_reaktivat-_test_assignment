import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { createElement, PropsWithChildren } from "react";
import { UserStorage } from "../../../entities/user/storage/user-storage.repository";
import { queryClient } from "../../api/query-client";

export const wrapper = ({ children }: PropsWithChildren) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

export const renderController = <T>(hook: () => T) =>
  renderHook(hook, { wrapper });

export const signIn = (user = "alice") => UserStorage.setState({ user });
