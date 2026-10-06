import type { ZodType } from "zod";
import { z } from "zod";
import { normalizeAxiosError } from "./axios/normalize-axios-error";
import { validateContractSchema } from "./validation/validate-contract-schema";

type HandlerConfig<TInSchema extends ZodType, TOutSchema extends ZodType> = {
  in: TInSchema;
  out: TOutSchema;
  action: (payload: z.infer<TInSchema>) => Promise<z.output<TOutSchema>>;
  name?: string;
};

export function createApiContract<
  TInSchema extends ZodType,
  TOutSchema extends ZodType,
>(config: HandlerConfig<TInSchema, TOutSchema>) {
  return async (payload: z.input<TInSchema>): Promise<z.output<TOutSchema>> => {
    try {
      const validatedInput = validateContractSchema(config.in, payload);
      const result = await config.action(validatedInput);

      return validateContractSchema(config.out, result);
    } catch (error: unknown) {
      const axiosError = normalizeAxiosError(error, payload);

      if (axiosError) {
        return Promise.reject({
          message: axiosError.message,
          status: axiosError.logExtra.status,
          details: axiosError.details,
        });
      }

      if (error instanceof z.ZodError) {
        return Promise.reject({ issues: error.issues });
      }

      if (error instanceof Error) {
        return Promise.reject({ message: error.message });
      }

      if ((error as any)?.message) {
        return Promise.reject({ message: (error as any)?.message });
      }

      return Promise.reject({ message: "unknown" });
    }
  };
}
