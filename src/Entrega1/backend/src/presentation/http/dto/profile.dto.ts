import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  AGE_GROUPS,
  AgeGroup,
  DOMINANT_HANDS,
  DominantHand,
  MAX_RESTRICTIONS_LENGTH,
  PRACTICE_GOALS,
  PracticeGoal,
  SKILL_LEVELS,
  SkillLevel,
} from '../../../domain/user/practitioner-profile';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2, { message: 'Informe seu nome completo.' })
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsIn(AGE_GROUPS, { message: 'Faixa etária inválida.' })
  ageGroup?: AgeGroup | null;

  @IsOptional()
  @IsIn(SKILL_LEVELS, { message: 'Nível inválido.' })
  skillLevel?: SkillLevel | null;

  @IsArray()
  @ArrayMaxSize(PRACTICE_GOALS.length)
  @ArrayUnique()
  @IsIn(PRACTICE_GOALS, { each: true, message: 'Objetivo inválido.' })
  goals: PracticeGoal[];

  @IsOptional()
  @IsIn(DOMINANT_HANDS, { message: 'Mão dominante inválida.' })
  dominantHand?: DominantHand | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_RESTRICTIONS_LENGTH)
  restrictions?: string | null;
}
