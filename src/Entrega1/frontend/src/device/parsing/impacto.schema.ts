import { z } from 'zod';
import { IMPACT_MAX_RAW, IMPACT_MIN_RAW } from '../contracts/impact';
import { TARGET_IDS, WALL_COLUMNS, WALL_ROWS } from '../contracts/target';

export const impactoSchema = z.object({
  alvo: z.number().int().min(1).max(TARGET_IDS.length),
  linha: z.number().int().min(1).max(WALL_ROWS.length),
  coluna: z.number().int().min(1).max(WALL_COLUMNS.length),
  intensidade: z.number().int().min(IMPACT_MIN_RAW).max(IMPACT_MAX_RAW),
  t_ms: z.number().int().min(0),
  sessao: z.string().min(1),
});

export type ImpactoMessage = z.infer<typeof impactoSchema>;
