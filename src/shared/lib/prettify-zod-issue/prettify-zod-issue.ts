import type { z } from "zod";
import { t } from "../i18n/i18n.instance";

type PrettifyZodIssue = (error: z.core.$ZodIssue, namespace: string) => string;
type IssueInterceptor = (issue: z.core.$ZodIssue) => string | z.core.$ZodIssue;

const customInterceptor = (issue: z.core.$ZodIssue) => {
  if (issue.code === "custom") return issue.message;
  return issue;
};

const nonemptyInterceptor = (issue: z.core.$ZodIssue) => {
  if (issue.code === "too_small" && issue.minimum === 1) return "nonempty";
  return issue;
};

const interceptors: IssueInterceptor[] = [
  nonemptyInterceptor,
  customInterceptor,
];

const pipeInterceptors = (issue: z.core.$ZodIssue): string => {
  for (const interceptor of interceptors) {
    const result = interceptor(issue);

    if (typeof result === "string") {
      return result;
    }
  }

  return issue.code;
};

export const prettifyZodError: PrettifyZodIssue = (error, namespace) => {
  const { path, ...rest } = error;

  const formatted_path = path
    .filter((p) => !Number.isInteger(Number(p)))
    .join(".");
  const formatted_code = pipeInterceptors(error);

  const key_path = [namespace, formatted_path, formatted_code].filter(Boolean);
  const key = `validation:${key_path.join(".")}`;

  return t(key, { ...rest });
};
