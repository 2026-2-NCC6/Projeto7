export type HitVerdict = 'correct' | 'incorrect';

export type FailureReason =
  | 'timeExpired'
  | 'mistakesExhausted'
  | 'deviceLost';

export type SessionPhase =
  | { readonly kind: 'preparing'; readonly remainingMs: number }
  | { readonly kind: 'awaitingHit' }
  | { readonly kind: 'resolving'; readonly verdict: HitVerdict; readonly remainingMs: number }
  | { readonly kind: 'paused' }
  | { readonly kind: 'deviceLost' }
  | { readonly kind: 'levelCleared' }
  | { readonly kind: 'levelFailed'; readonly reason: FailureReason };

export function isTerminal(phase: SessionPhase): boolean {
  return phase.kind === 'levelCleared' || phase.kind === 'levelFailed';
}

export function isPlaying(phase: SessionPhase): boolean {
  return phase.kind === 'preparing' || phase.kind === 'awaitingHit' || phase.kind === 'resolving';
}
