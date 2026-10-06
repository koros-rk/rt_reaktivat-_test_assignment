import type { ZodType, z } from 'zod'

export function validateContractSchema<T extends ZodType>(
  schema: T,
  data: unknown,
): z.output<T> {
  const parsed = schema.safeParse(data, { reportInput: true })

  if (!parsed.success) {
    throw parsed.error
  }

  return parsed.data
}
