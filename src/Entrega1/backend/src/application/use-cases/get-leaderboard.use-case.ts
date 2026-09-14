import { LEADERBOARD_SIZE, LeaderboardEntry } from '../../domain/ranking/leaderboard';
import { RankingCategory } from '../../domain/ranking/ranking-category';
import { RankingRepository } from '../../domain/ranking/ranking-repository.port';

export interface RankedPlayerView {
  position: number;
  name: string;
  value: number;
  isViewer: boolean;
}

export interface LeaderboardView {
  category: RankingCategory;
  total: number;
  entries: RankedPlayerView[];
  viewer: RankedPlayerView | null;
}

function toRankedPlayerView(entry: LeaderboardEntry, viewerId: string | null): RankedPlayerView {
  return {
    position: entry.position,
    name: entry.name,
    value: entry.value,
    isViewer: entry.userId === viewerId,
  };
}

export class GetLeaderboardUseCase {
  constructor(private readonly rankings: RankingRepository) {}

  async execute(category: RankingCategory, viewerId: string | null): Promise<LeaderboardView> {
    const [standings, viewerStanding] = await Promise.all([
      this.rankings.standings(category, LEADERBOARD_SIZE),
      viewerId ? this.rankings.standingOf(category, viewerId) : Promise.resolve(null),
    ]);

    return {
      category,
      total: standings.total,
      entries: standings.entries.map((entry) => toRankedPlayerView(entry, viewerId)),
      viewer: viewerStanding && toRankedPlayerView(viewerStanding, viewerId),
    };
  }
}
