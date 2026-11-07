import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  AUDIENCES,
  Audience,
  CATEGORIES,
  Category,
  DIFFICULTIES,
  Difficulty,
  LICENSES,
  License,
  MAX_POINTS_PER_COLOR,
  MAX_STEPS,
  MAX_STREAK_MULTIPLIER,
  OBJECTIVES,
  Objective,
  PRICING_MODELS,
  PricingModel,
  TARGET_COLORS,
  TargetColor,
  TrainingContent,
  TrainingStep,
} from '../../../domain/training/training-content';

const SECOND = 1000;
const MAX_LIST_ITEMS = 10;
const MAX_ITEM_LENGTH = 120;

export class StreakMultiplierDto {
  @IsInt()
  @Min(1)
  @Max(20)
  every: number;

  @IsNumber()
  @Min(0.05)
  @Max(1)
  step: number;

  @IsNumber()
  @Min(1)
  @Max(MAX_STREAK_MULTIPLIER)
  max: number;
}

export class PointsPerColorDto {
  @IsInt()
  @Min(0)
  @Max(MAX_POINTS_PER_COLOR)
  amber: number;

  @IsInt()
  @Min(0)
  @Max(MAX_POINTS_PER_COLOR)
  blue: number;

  @IsInt()
  @Min(0)
  @Max(MAX_POINTS_PER_COLOR)
  red: number;
}

export class ColorStepConfigDto {
  @IsInt()
  @Min(1)
  @Max(50)
  sequenceLength: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(TARGET_COLORS, { each: true })
  palette: TargetColor[];

  @IsOptional()
  @IsInt()
  @Min(500)
  @Max(30 * SECOND)
  reactionWindowMs?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxMistakes?: number | null;

  @IsInt()
  @Min(1)
  @Max(MAX_POINTS_PER_COLOR)
  pointsPerHit: number;

  @IsInt()
  @Min(80)
  @Max(3 * SECOND)
  recoveryMs: number;
}

export class ScoreStepConfigDto {
  @IsInt()
  @Min(10)
  @Max(100_000)
  targetScore: number;

  @IsOptional()
  @IsInt()
  @Min(10 * SECOND)
  @Max(30 * 60 * SECOND)
  timeLimitMs?: number | null;

  @ValidateNested()
  @Type(() => PointsPerColorDto)
  pointsPerColor: PointsPerColorDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(TARGET_COLORS, { each: true })
  palette: TargetColor[];

  @IsOptional()
  @ValidateNested()
  @Type(() => StreakMultiplierDto)
  streakMultiplier?: StreakMultiplierDto | null;

  @IsInt()
  @Min(-MAX_POINTS_PER_COLOR)
  @Max(0)
  missPenalty: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  requiredAccuracyPercent?: number | null;

  @IsInt()
  @Min(80)
  @Max(3 * SECOND)
  recoveryMs: number;
}

export abstract class TrainingStepDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  title: string;
}

export class ColorStepDto extends TrainingStepDto {
  @IsIn(['level_color'])
  mode: 'level_color';

  @ValidateNested()
  @Type(() => ColorStepConfigDto)
  config: ColorStepConfigDto;
}

export class ScoreStepDto extends TrainingStepDto {
  @IsIn(['level_score'])
  mode: 'level_score';

  @ValidateNested()
  @Type(() => ScoreStepConfigDto)
  config: ScoreStepConfigDto;
}

export class MarketplaceDto {
  @IsIn(CATEGORIES)
  category: Category;

  @IsString()
  @MaxLength(600)
  commercialDescription: string;

  @IsIn(LICENSES)
  license: License;

  @IsIn(PRICING_MODELS)
  pricingModel: PricingModel;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  priceCents?: number | null;

  @IsArray()
  @ArrayMaxSize(MAX_LIST_ITEMS)
  @IsString({ each: true })
  @MaxLength(MAX_ITEM_LENGTH, { each: true })
  compatibility: string[];
}

export class TrainingContentDto {
  @IsString()
  @MinLength(3, { message: 'Dê um título com ao menos 3 letras.' })
  @MaxLength(80)
  title: string;

  @IsString()
  @MaxLength(280)
  summary: string;

  @IsIn(AUDIENCES)
  audience: Audience;

  @IsIn(OBJECTIVES)
  objective: Objective;

  @IsIn(DIFFICULTIES)
  difficulty: Difficulty;

  @IsInt()
  @Min(1)
  @Max(180)
  estimatedMinutes: number;

  @IsString()
  @MaxLength(2000)
  instructions: string;

  @IsString()
  @MaxLength(2000)
  scoringRules: string;

  @IsArray()
  @ArrayMaxSize(MAX_LIST_ITEMS)
  @IsString({ each: true })
  @MaxLength(MAX_ITEM_LENGTH, { each: true })
  equipment: string[];

  @IsArray()
  @ArrayMaxSize(MAX_LIST_ITEMS)
  @IsString({ each: true })
  @MaxLength(MAX_ITEM_LENGTH, { each: true })
  risks: string[];

  @IsArray()
  @ArrayMaxSize(MAX_STEPS)
  @ValidateNested({ each: true })
  @Type(() => TrainingStepDto, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'mode',
      subTypes: [
        { value: ColorStepDto, name: 'level_color' },
        { value: ScoreStepDto, name: 'level_score' },
      ],
    },
  })
  steps: (ColorStepDto | ScoreStepDto)[];

  @ValidateNested()
  @Type(() => MarketplaceDto)
  marketplace: MarketplaceDto;
}

function cleanList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter((item) => item.length > 0);
}

function toStep(step: ColorStepDto | ScoreStepDto): TrainingStep {
  if (step.mode === 'level_color') {
    const { config } = step as ColorStepDto;

    return {
      title: step.title.trim(),
      mode: 'level_color',
      config: {
        sequenceLength: config.sequenceLength,
        palette: config.palette,
        reactionWindowMs: config.reactionWindowMs ?? null,
        maxMistakes: config.maxMistakes ?? null,
        pointsPerHit: config.pointsPerHit,
        recoveryMs: config.recoveryMs,
      },
    };
  }

  const { config } = step as ScoreStepDto;

  return {
    title: step.title.trim(),
    mode: 'level_score',
    config: {
      targetScore: config.targetScore,
      timeLimitMs: config.timeLimitMs ?? null,
      pointsPerColor: {
        amber: config.pointsPerColor.amber,
        blue: config.pointsPerColor.blue,
        red: config.pointsPerColor.red,
      },
      palette: config.palette,
      streakMultiplier: config.streakMultiplier
        ? {
            every: config.streakMultiplier.every,
            step: config.streakMultiplier.step,
            max: config.streakMultiplier.max,
          }
        : null,
      missPenalty: config.missPenalty,
      requiredAccuracyPercent: config.requiredAccuracyPercent ?? null,
      recoveryMs: config.recoveryMs,
    },
  };
}

export function toTrainingContent(dto: TrainingContentDto): TrainingContent {
  return {
    title: dto.title.trim(),
    summary: dto.summary.trim(),
    audience: dto.audience,
    objective: dto.objective,
    difficulty: dto.difficulty,
    estimatedMinutes: dto.estimatedMinutes,
    instructions: dto.instructions.trim(),
    scoringRules: dto.scoringRules.trim(),
    equipment: cleanList(dto.equipment),
    risks: cleanList(dto.risks),
    steps: dto.steps.map(toStep),
    marketplace: {
      category: dto.marketplace.category,
      commercialDescription: dto.marketplace.commercialDescription.trim(),
      license: dto.marketplace.license,
      pricingModel: dto.marketplace.pricingModel,
      priceCents: dto.marketplace.priceCents ?? null,
      compatibility: cleanList(dto.marketplace.compatibility),
    },
  };
}
