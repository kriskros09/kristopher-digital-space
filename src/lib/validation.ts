import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z.string().optional(),
  tts: z.string().optional(),
}); 