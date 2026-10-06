import { t } from "i18next";
import { enqueueSnackbar } from "notistack";
import { match } from "ts-pattern";
import { z } from "zod";

export const errorHandler = (error: unknown) => {
  const messages = match(error)
    .when(
      (value): value is z.ZodError => value instanceof z.ZodError,
      (value) => value.issues.map((issue) => issue.message),
    )
    .when(
      (value): value is { issues: { message?: unknown }[] } =>
        typeof value === "object" &&
        value !== null &&
        "issues" in value &&
        Array.isArray(value.issues),
      (value) =>
        value.issues.map((issue) =>
          typeof issue?.message === "string" && issue.message
            ? issue.message
            : "unknown",
        ),
    )
    .when(
      (value): value is Error => value instanceof Error,
      (value) => [value.message || "unknown"],
    )
    .when(
      (value): value is { message?: unknown } =>
        typeof value === "object" && value !== null && "message" in value,
      (value) => [
        typeof value.message === "string" && value.message
          ? value.message
          : "unknown",
      ],
    )
    .otherwise(() => ["unknown"]);

  return messages.map((message) => {
    const translated = t(`notification:${message}`).replace(
      "notification:",
      "",
    );
    return enqueueSnackbar(translated, { variant: "error" });
  });
};
