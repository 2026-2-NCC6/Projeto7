import { DataSource } from 'typeorm';
import { LeaderboardEntry, Standings } from '../../../domain/ranking/leaderboard';
import { RankingCategory } from '../../../domain/ranking/ranking-category';
import { RankingRepository } from '../../../domain/ranking/ranking-repository.port';

interface StandingRow {
  user_id: string;
  name: string;
  value: string;
  position: string;
}

const VALUE_SOURCE: Record<RankingCategory, string> = {
  xp: `SELECT user_id, SUM(xp_awarded) AS value FROM training_sessions GROUP BY user_id`,
  bestScore: `SELECT user_id, MAX(score) AS value FROM training_sessions GROUP BY user_id`,
  totalScore: `SELECT user_id, SUM(score) AS value FROM training_sessions GROUP BY user_id`,
  infiniteColor: `
    SELECT user_id, MAX(score) AS value FROM training_sessions
    WHERE mode = 'infinite_color' GROUP BY user_id`,
  infiniteScore: `
    SELECT user_id, MAX(score) AS value FROM training_sessions
    WHERE mode = 'infinite_score' GROUP BY user_id`,
  dailyStreak: `SELECT user_id, longest_streak AS value FROM daily_streaks`,
};

function rankedStandings(category: RankingCategory): string {
  return `
    WITH ranked AS (
      SELECT source.user_id, users.name, source.value,
        RANK() OVER (ORDER BY source.value DESC) AS position
      FROM (${VALUE_SOURCE[category]}) AS source
      JOIN users ON users.id = source.user_id
      WHERE source.value > 0
    )
  `;
}

function toEntry(row: StandingRow): LeaderboardEntry {
  return {
    position: Number(row.position),
    userId: row.user_id,
    name: row.name,
    value: Number(row.value),
  };
}

export class TypeOrmRankingRepository implements RankingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async standings(category: RankingCategory, limit: number): Promise<Standings> {
    const [rows, total] = await Promise.all([
      this.dataSource.query<StandingRow[]>(
        `${rankedStandings(category)}
         SELECT user_id, name, value, position FROM ranked
         ORDER BY position, name, user_id
         LIMIT $1`,
        [limit],
      ),
      this.rankedCount(category),
    ]);

    return { entries: rows.map(toEntry), total };
  }

  async standingOf(category: RankingCategory, userId: string): Promise<LeaderboardEntry | null> {
    const [row] = await this.dataSource.query<StandingRow[]>(
      `${rankedStandings(category)}
       SELECT user_id, name, value, position FROM ranked WHERE user_id = $1`,
      [userId],
    );

    return row ? toEntry(row) : null;
  }

  async rankedCount(category: RankingCategory): Promise<number> {
    const [row] = await this.dataSource.query<{ total: string }[]>(
      `${rankedStandings(category)} SELECT COUNT(*) AS total FROM ranked`,
    );

    return Number(row?.total ?? 0);
  }
}
