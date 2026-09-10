export interface StreakMultiplier {
  readonly every: number;
  readonly step: number;
  readonly max: number;
}

export function multiplierFor(streak: number, multiplier: StreakMultiplier | null): number {
  if (!multiplier) {
    return 1;
  }

  return Math.min(multiplier.max, 1 + Math.floor(streak / multiplier.every) * multiplier.step);
}
