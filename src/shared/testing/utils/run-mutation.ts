import {
  MutationObserver,
  MutationObserverOptions,
} from "@tanstack/react-query";
import { queryClient } from "../../api/query-client";

export const runMutation = <TVars>(
  options: MutationObserverOptions<any, any, TVars>,
  variables: TVars,
) => new MutationObserver(queryClient, options).mutate(variables);
