import type { TargetHitEvent } from '../../../device/contracts';
import type { GameRules, RoundOutcome, SessionTiming } from '../../domain/game-rules';
import { multiplierFor } from '../shared/scoring';
import { bonusMsFor, grantTime } from '../shared/time-budget';
import type { InfiniteScoreConfig } from './infinite-score-levels';
import { infiniteScoreLevels } from './infinite-score-levels';

export interface InfiniteScoreState {
  readonly score: number;
  readonly streak: number;
  /** Instant on the session clock when the time bank runs out. */
  readonly deadlineMs: number;
}

/** An endless run has no finish line, so there is no progress to report. */
const NO_PROGRESS = 0;

function outcome(
  state: InfiniteScoreState,
  verdict: 'correct' | 'incorrect',
  scoreDelta: number,
): RoundOutcome<InfiniteScoreState> {
  return { state, verdict, scoreDelta, progress: NO_PROGRESS, resolution: 'continue' };
}

export const infiniteScoreRules: GameRules<InfiniteScoreConfig, InfiniteScoreState> = {
  mode: 'infinite_score',
  levels: infiniteScoreLevels,

  start(config) {
    return { score: 0, streak: 0, deadlineMs: config.timeBudget.startBudgetMs };
  },

  onHit(state, hit: TargetHitEvent, config, timing) {
    if (!config.palette.includes(hit.color)) {
      const penalty = Math.max(-state.score, config.missPenalty);

      return outcome(
        {
          score: state.score + penalty,
          streak: 0,
          deadlineMs: state.deadlineMs - config.timeBudget.missPenaltyMs,
        },
        'incorrect',
        penalty,
      );
    }

    const gain = Math.round(
      config.pointsPerColor[hit.color] * multiplierFor(state.streak, config.streakMultiplier),
    );
    const score = state.score + gain;

    return outcome(
      {
        score,
        streak: state.streak + 1,
        deadlineMs: grantTime(
          state.deadlineMs,
          timing.sessionElapsedMs,
          bonusMsFor(score, config.timeBudget),
          config.timeBudget,
        ),
      },
      'correct',
      gain,
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
