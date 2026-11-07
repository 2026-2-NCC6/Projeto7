export const END_REASONS = [
  'cleared',
  'timeExpired',
  'mistakesExhausted',
  'deviceLost',
  'emergencyStop',
] as const;

export type EndReason = (typeof END_REASONS)[number];

export const ATTEMPT_VERDICTS = ['correct', 'incorrect'] as const;

export type AttemptVerdict = (typeof ATTEMPT_VERDICTS)[number];

export const MAX_RECORDED_ATTEMPTS = 2000;
export const MAX_STOP_REASON_LENGTH = 200;
export const OFFLINE_SYNC_WINDOW_DAYS = 30;

export interface TrainingRef {
  id: string;
  version: number;
  stepIndex: number;
}

export interface SessionInterruptions {
  pauses: number;
  deviceLosses: number;
  faults: number;
}

export interface SessionAttempt {
  atMs: number;
  responseMs: number;
  verdict: AttemptVerdict;
  targetId: number | null;
  scoreDelta: number;
  intensity: number | null;
}

export interface SessionAttemptInput extends Omit<SessionAttempt, 'targetId' | 'intensity'> {
  targetId?: number | null;
  intensity?: number | null;
}

export function toSessionAttempt(input: SessionAttemptInput): SessionAttempt {
  return {
    atMs: input.atMs,
    responseMs: input.responseMs,
    verdict: input.verdict,
    targetId: input.targetId ?? null,
    scoreDelta: input.scoreDelta,
    intensity: input.intensity ?? null,
  };
}

export const NO_INTERRUPTIONS: SessionInterruptions = { pauses: 0, deviceLosses: 0, faults: 0 };

export function sameTraining(left: TrainingRef | null, right: TrainingRef | null): boolean {
  if (!left || !right) {
    return left === right;
  }

  return left.id === right.id && left.version === right.version && left.stepIndex === right.stepIndex;
}
