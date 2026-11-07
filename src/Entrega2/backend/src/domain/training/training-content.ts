export const TARGET_COLORS = ['amber', 'blue', 'red'] as const;
export const TRAINING_STEP_MODES = ['level_color', 'level_score'] as const;
export const AUDIENCES = ['kids', 'teens', 'adults', 'seniors', 'all'] as const;
export const OBJECTIVES = ['precision', 'consistency', 'reaction', 'endurance', 'fun'] as const;
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export const CATEGORIES = ['warmup', 'precision', 'reaction', 'endurance', 'kids', 'competition'] as const;
export const LICENSES = ['free', 'cc_by', 'proprietary'] as const;
export const PRICING_MODELS = ['free', 'one_time', 'subscription'] as const;

export const MAX_STEPS = 10;
export const MAX_POINTS_PER_COLOR = 50;
export const MAX_STREAK_MULTIPLIER = 3;

export type TargetColor = (typeof TARGET_COLORS)[number];
export type TrainingStepMode = (typeof TRAINING_STEP_MODES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type Objective = (typeof OBJECTIVES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type Category = (typeof CATEGORIES)[number];
export type License = (typeof LICENSES)[number];
export type PricingModel = (typeof PRICING_MODELS)[number];

export interface ColorStepConfig {
  sequenceLength: number;
  palette: TargetColor[];
  reactionWindowMs: number | null;
  maxMistakes: number | null;
  pointsPerHit: number;
  recoveryMs: number;
}

export interface StreakMultiplier {
  every: number;
  step: number;
  max: number;
}

export interface ScoreStepConfig {
  targetScore: number;
  timeLimitMs: number | null;
  pointsPerColor: Record<TargetColor, number>;
  palette: TargetColor[];
  streakMultiplier: StreakMultiplier | null;
  missPenalty: number;
  requiredAccuracyPercent: number | null;
  recoveryMs: number;
}

export type TrainingStep =
  | { title: string; mode: 'level_color'; config: ColorStepConfig }
  | { title: string; mode: 'level_score'; config: ScoreStepConfig };

export interface MarketplaceMetadata {
  category: Category;
  commercialDescription: string;
  license: License;
  pricingModel: PricingModel;
  priceCents: number | null;
  compatibility: string[];
}

export interface TrainingContent {
  title: string;
  summary: string;
  audience: Audience;
  objective: Objective;
  difficulty: Difficulty;
  estimatedMinutes: number;
  instructions: string;
  scoringRules: string;
  equipment: string[];
  risks: string[];
  steps: TrainingStep[];
  marketplace: MarketplaceMetadata;
}

export function targetColorsOf(content: TrainingContent): TargetColor[] {
  const used = new Set(content.steps.flatMap((step) => step.config.palette));
  return TARGET_COLORS.filter((color) => used.has(color));
}

function colorStepProblems(config: ColorStepConfig): string[] {
  const problems: string[] = [];

  if (config.palette.length === 0) {
    problems.push('escolha ao menos uma cor de alvo');
  }
  if (config.pointsPerHit > MAX_POINTS_PER_COLOR) {
    problems.push(`no máximo ${MAX_POINTS_PER_COLOR} pontos por acerto`);
  }

  return problems;
}

function scoreStepProblems(config: ScoreStepConfig): string[] {
  const problems: string[] = [];
  const scoring = config.palette.map((color) => config.pointsPerColor[color]);

  if (config.palette.length === 0) {
    problems.push('escolha ao menos uma cor de alvo');
  }
  if (scoring.some((points) => points <= 0)) {
    problems.push('toda cor da paleta precisa valer pontos');
  }
  if (Object.values(config.pointsPerColor).some((points) => points > MAX_POINTS_PER_COLOR)) {
    problems.push(`no máximo ${MAX_POINTS_PER_COLOR} pontos por cor`);
  }
  if (config.streakMultiplier && config.streakMultiplier.max > MAX_STREAK_MULTIPLIER) {
    problems.push(`multiplicador de sequência até ${MAX_STREAK_MULTIPLIER}x`);
  }
  if (config.missPenalty > 0) {
    problems.push('a penalidade por erro precisa ser zero ou negativa');
  }

  return problems;
}

export function trainingContentProblems(content: TrainingContent): string[] {
  const problems: string[] = [];

  if (content.steps.length === 0) {
    problems.push('O treino precisa de ao menos uma etapa.');
  }
  if (content.steps.length > MAX_STEPS) {
    problems.push(`O treino aceita até ${MAX_STEPS} etapas.`);
  }
  if (content.marketplace.pricingModel === 'free' && content.marketplace.priceCents) {
    problems.push('Um treino gratuito não tem preço.');
  }

  content.steps.forEach((step, index) => {
    const stepProblems =
      step.mode === 'level_color' ? colorStepProblems(step.config) : scoreStepProblems(step.config);

    stepProblems.forEach((problem) => problems.push(`Etapa ${index + 1}: ${problem}.`));
  });

  return problems;
}
