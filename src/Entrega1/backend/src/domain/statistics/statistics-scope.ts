export type StatisticsScope = { kind: 'player'; userId: string } | { kind: 'all' };

export function playerScope(userId: string): StatisticsScope {
  return { kind: 'player', userId };
}
