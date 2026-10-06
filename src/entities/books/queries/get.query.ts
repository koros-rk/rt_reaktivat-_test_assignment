import { queryOptions } from "@tanstack/react-query";
import { GetBooksContract } from "../contracts/get.contract";
import { GetBooksRequest } from "../schemas/get.schema";

export const GetBooksQuery = (payload: GetBooksRequest) =>
  queryOptions({
    queryKey: ["books", payload],
    queryFn: () => GetBooksContract(payload),
  });
