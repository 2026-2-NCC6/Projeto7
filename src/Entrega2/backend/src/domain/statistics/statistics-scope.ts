export type StatisticsScope =
  | { kind: 'player'; userId: string }
  | { kind: 'training'; trainingId: string }
  | { kind: 'all' };

export function playerScope(userId: string): StatisticsScope {
  return { kind: 'player', userId };
}

export function trainingScope(trainingId: string): StatisticsScope {
  return { kind: 'training', trainingId };
}

export const ALL_SCOPE: StatisticsScope = { kind: 'all' };
