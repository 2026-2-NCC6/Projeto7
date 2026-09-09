import { z } from 'zod';
import { IMPACT_MAX_RAW, IMPACT_MIN_RAW } from '../contracts/impact';

const gridAxis = z.number().int().min(1).max(3);

export const impactoSchema = z.object({
  alvo: z.number().int().min(1).max(9),
  linha: gridAxis,
  coluna: gridAxis,
  intensidade: z.number().int().min(IMPACT_MIN_RAW).max(IMPACT_MAX_RAW),
  t_ms: z.number().int().min(0),
  sessao: z.string().min(1),
});

export type ImpactoMessage = z.infer<typeof impactoSchema>;
