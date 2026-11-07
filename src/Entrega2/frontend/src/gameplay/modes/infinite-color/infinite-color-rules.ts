import type { TargetHitEvent } from '../../../device/contracts';
import type { TargetColor } from '../../../types/game';
import type { GameRules, RoundOutcome, SessionTiming } from '../../domain/game-rules';
import { buildSequence } from '../shared/color-sequence';
import { bonusMsFor, grantTime } from '../shared/time-budget';
import type { InfiniteColorConfig } from './infinite-color-levels';
import { infiniteColorLevels } from './infinite-color-levels';

export interface InfiniteColorState {
  readonly queue: readonly TargetColor[];
  readonly index: number;
  /** Kept here because the reward curve reads it and rules only see their own state. */
  readonly score: number;
  /** Instant on the session clock when the time bank runs out. */
  readonly deadlineMs: number;
}

export function currentColorOf(state: InfiniteColorState): TargetColor {
  return state.queue[state.index % state.queue.length];
}

/** An endless run has no finish line, so there is no progress to report. */
const NO_PROGRESS = 0;

function outcome(
  state: InfiniteColorState,
  verdict: 'correct' | 'incorrect',
  scoreDelta: number,
): RoundOutcome<InfiniteColorState> {
  return { state, verdict, scoreDelta, progress: NO_PROGRESS, resolution: 'continue' };
}

export const infiniteColorRules: GameRules<InfiniteColorConfig, InfiniteColorState> = {
  mode: 'infinite_color',
  levels: infiniteColorLevels,

  start(config, random) {
    return {
      queue: buildSequence(config.palette, config.promptQueueLength, random),
      index: 0,
      score: 0,
      deadlineMs: config.timeBudget.startBudgetMs,
    };
  },

  onHit(state, hit: TargetHitEvent, config, timing) {
    if (hit.color !== currentColorOf(state)) {
      return outcome(
        { ...state, deadlineMs: state.deadlineMs - config.timeBudget.missPenaltyMs },
        'incorrect',
        0,
      );
    }

    const score = state.score + config.pointsPerHit;

    return outcome(
      {
        ...state,
        index: state.index + 1,
        score,
        deadlineMs: grantTime(
          state.deadlineMs,
          timing.sessionElapsedMs,
          bonusMsFor(score, config.timeBudget),
          config.timeBudget,
        ),
      },
      'correct',
      config.pointsPerHit,
    );
  },

  onElapsed(state, timing: SessionTiming) {
    if (timing.sessionElapsedMs < state.deadlineMs) {
      return null;
    }

    // Every run ends here, so this is not counted as a missed attempt: it would
    // subtract a point of accuracy from every single session.
    return {
      state,
      verdict: 'incorrect',
      scoreDelta: 0,
      progress: NO_PROGRESS,
      resolution: 'failed',
      failureReason: 'timeExpired',
    };
  },
};
