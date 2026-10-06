import { AxiosError } from "axios";

export const makeAxiosError = ({
  status,
  data,
  code,
  message,
}: {
  status?: number;
  data?: unknown;
  code?: string;
  message?: string;
}) => {
  const response = status
    ? { status, data, statusText: "", headers: {}, config: {} as any }
    : undefined;
  return new AxiosError(
    message ?? `Request failed with status code ${status}`,
    code ?? (status ? "ERR_BAD_REQUEST" : "ERR_NETWORK"),
    { url: "/x", method: "get" } as any,
    {},
    response,
  );
};
