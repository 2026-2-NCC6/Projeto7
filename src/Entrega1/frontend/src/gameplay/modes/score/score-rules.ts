import type { TargetHitEvent } from '../../../device/contracts';
import type {
  GameRules,
  RoundOutcome,
  SessionTiming,
} from '../../domain/game-rules';
import type { ScoreLevelConfig, StreakMultiplier } from './score-levels';
import { scoreLevels } from './score-levels';

const PERCENT = 100;

export interface ScoreRoundState {
  readonly score: number;
  readonly streak: number;
  readonly attempts: number;
  readonly correctHits: number;
}

export function multiplierFor(streak: number, multiplier: StreakMultiplier | null): number {
  if (!multiplier) {
    return 1;
  }

  return Math.min(multiplier.max, 1 + Math.floor(streak / multiplier.every) * multiplier.step);
}

export function accuracyOf(state: ScoreRoundState): number | null {
  return state.attempts === 0 ? null : (state.correctHits / state.attempts) * PERCENT;
}

function meetsAccuracy(state: ScoreRoundState, config: ScoreLevelConfig): boolean {
  if (config.requiredAccuracyPercent === null) {
    return true;
  }

  const accuracy = accuracyOf(state);
  return accuracy !== null && accuracy >= config.requiredAccuracyPercent;
}

function outcomeFor(
  state: ScoreRoundState,
  config: ScoreLevelConfig,
  verdict: 'correct' | 'incorrect',
  scoreDelta: number,
): RoundOutcome<ScoreRoundState> {
  const cleared = state.score >= config.targetScore && meetsAccuracy(state, config);

  return {
    state,
    verdict,
    scoreDelta,
    progress: Math.min(1, state.score / config.targetScore),
    resolution: cleared ? 'cleared' : 'continue',
  };
}

export const scoreRules: GameRules<ScoreLevelConfig, ScoreRoundState> = {
  mode: 'level_score',
  levels: scoreLevels,

  start() {
    return { score: 0, streak: 0, attempts: 0, correctHits: 0 };
  },

  onHit(state, hit: TargetHitEvent, config) {
    if (!config.palette.includes(hit.color)) {
      const penalty = Math.max(-state.score, config.missPenalty);

      return outcomeFor(
        {
          score: state.score + penalty,
          streak: 0,
          attempts: state.attempts + 1,
          correctHits: state.correctHits,
        },
        config,
        'incorrect',
        penalty,
      );
    }

    const gain = Math.round(
      config.pointsPerColor[hit.color] * multiplierFor(state.streak, config.streakMultiplier),
    );

    return outcomeFor(
      {
        score: state.score + gain,
        streak: state.streak + 1,
        attempts: state.attempts + 1,
        correctHits: state.correctHits + 1,
      },
      config,
      'correct',
      gain,
    );
  },

  onElapsed(state, timing: SessionTiming, config) {
    if (config.timeLimitMs === null || timing.sessionElapsedMs < config.timeLimitMs) {
      return null;
    }

    return {
      state,
      verdict: 'incorrect',
      scoreDelta: 0,
      progress: Math.min(1, state.score / config.targetScore),
      resolution: 'failed',
      failureReason: 'timeExpired',
    };
  },
};
