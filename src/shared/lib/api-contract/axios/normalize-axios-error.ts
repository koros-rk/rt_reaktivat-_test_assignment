import { isAxiosError } from "axios";
import { shouldLogAxios } from "./should-log-axios";

export interface ServerValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export function normalizeAxiosError(error: unknown, payload: unknown) {
  if (!isAxiosError(error)) return null;

  const serverMessage = error.response?.data?.detail as
    string | ServerValidationError[];
  const responseMessage = error.message.replaceAll(" ", "_").toLowerCase();

  return {
    shouldLog: shouldLogAxios(error),
    logExtra: {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      error: error.toJSON(),
      payload,
    },
    message:
      typeof serverMessage === "string" ? serverMessage : responseMessage,
    details: typeof serverMessage === "object" ? serverMessage : undefined,
  };
}
