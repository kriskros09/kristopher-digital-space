import { ZodSchema } from "zod";

export async function validateRequest<T>(req: Request, schema: ZodSchema<T>) {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
} 