import type { TargetHitEvent } from '../../../device/contracts';
import type { TargetColor } from '../../../types/game';
import type {
  GameRules,
  RandomSource,
  RoundOutcome,
  SessionTiming,
} from '../../domain/game-rules';
import type { ColorLevelConfig } from './color-levels';
import { colorLevels } from './color-levels';

export interface ColorRoundState {
  readonly sequence: readonly TargetColor[];
  readonly index: number;
  readonly mistakes: number;
}

export function currentColorOf(state: ColorRoundState): TargetColor {
  return state.sequence[state.index] ?? state.sequence[state.sequence.length - 1];
}

function buildSequence(config: ColorLevelConfig, random: RandomSource): TargetColor[] {
  const sequence: TargetColor[] = [];

  while (sequence.length < config.sequenceLength) {
    const choices = config.palette.filter((color) => color !== sequence[sequence.length - 1]);
    sequence.push(choices[Math.floor(random() * choices.length)]);
  }

  return sequence;
}

function advanced(state: ColorRoundState, config: ColorLevelConfig): RoundOutcome<ColorRoundState> {
  const index = state.index + 1;
  const cleared = index >= state.sequence.length;

  return {
    state: { ...state, index },
    verdict: 'correct',
    scoreDelta: config.pointsPerHit,
    progress: index / state.sequence.length,
    resolution: cleared ? 'cleared' : 'continue',
  };
}

function missed(
  state: ColorRoundState,
  config: ColorLevelConfig,
): RoundOutcome<ColorRoundState> {
  const mistakes = state.mistakes + 1;
  const exhausted = config.maxMistakes !== null && mistakes > config.maxMistakes;

  return {
    state: { ...state, index: 0, mistakes },
    verdict: 'incorrect',
    scoreDelta: 0,
    progress: 0,
    resolution: exhausted ? 'failed' : 'continue',
    failureReason: exhausted ? 'mistakesExhausted' : undefined,
  };
}

export const colorRules: GameRules<ColorLevelConfig, ColorRoundState> = {
  mode: 'level_color',
  levels: colorLevels,

  start(config, random) {
    return { sequence: buildSequence(config, random), index: 0, mistakes: 0 };
  },

  onHit(state, hit: TargetHitEvent, config) {
    return hit.color === currentColorOf(state) ? advanced(state, config) : missed(state, config);
  },

  onElapsed(state, timing: SessionTiming, config) {
    if (config.reactionWindowMs === null || timing.promptElapsedMs < config.reactionWindowMs) {
      return null;
    }

    return { ...missed(state, config), missedAttempt: true };
  },
};
