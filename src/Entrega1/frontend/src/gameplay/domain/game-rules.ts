import type { TargetHitEvent } from '../../device/contracts';
import type { PlayableModeId } from '../../types/game';
import type { FailureReason, HitVerdict } from './session-phase';

export type DifficultyBand = 'intro' | 'easy' | 'medium' | 'hard' | 'expert';

export interface LevelConfig {
  readonly level: number;
  readonly difficulty: DifficultyBand;
  /** How long the hit feedback holds before the next hit is accepted. */
  readonly recoveryMs: number;
}

export interface SessionTiming {
  readonly sessionElapsedMs: number;
  readonly promptElapsedMs: number;
}

export type RoundResolution = 'continue' | 'cleared' | 'failed';

export interface RoundOutcome<TState> {
  readonly state: TState;
  readonly verdict: HitVerdict;
  readonly scoreDelta: number;
  readonly progress: number;
  readonly resolution: RoundResolution;
  readonly failureReason?: FailureReason;
  /** Set by an elapsed-time outcome that the player actually missed. */
  readonly missedAttempt?: boolean;
}

export type RandomSource = () => number;

export interface GameRules<TConfig extends LevelConfig, TState> {
  readonly mode: PlayableModeId;
  readonly levels: readonly TConfig[];
  start(config: TConfig, random: RandomSource): TState;
  onHit(state: TState, hit: TargetHitEvent, config: TConfig): RoundOutcome<TState>;
  onElapsed(state: TState, timing: SessionTiming, config: TConfig): RoundOutcome<TState> | null;
}

export function levelOf<TConfig extends LevelConfig>(
  levels: readonly TConfig[],
  level: number,
): TConfig | null {
  return levels.find((config) => config.level === level) ?? null;
}
