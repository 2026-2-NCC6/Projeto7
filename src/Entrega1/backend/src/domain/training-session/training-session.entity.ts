import { GameMode } from '../game/game-mode';

export interface TrainingSessionProps {
  id: string;
  userId: string;
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
  hits: number;
  misses: number;
  bestStreak: number;
  durationMs: number;
  avgResponseMs: number | null;
  bestResponseMs: number | null;
  xpAwarded: number;
  playedAt: Date;
}

export class TrainingSession {
  private constructor(private readonly props: TrainingSessionProps) {}

  static restore(props: TrainingSessionProps): TrainingSession {
    return new TrainingSession(props);
  }

  static record(props: Omit<TrainingSessionProps, 'playedAt'>): TrainingSession {
    return new TrainingSession({ ...props, playedAt: new Date() });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get mode(): GameMode {
    return this.props.mode;
  }

  get level(): number {
    return this.props.level;
  }

  get cleared(): boolean {
    return this.props.cleared;
  }

  get score(): number {
    return this.props.score;
  }

  get hits(): number {
    return this.props.hits;
  }

  get misses(): number {
    return this.props.misses;
  }

  get bestStreak(): number {
    return this.props.bestStreak;
  }

  get durationMs(): number {
    return this.props.durationMs;
  }

  get avgResponseMs(): number | null {
    return this.props.avgResponseMs;
  }

  get bestResponseMs(): number | null {
    return this.props.bestResponseMs;
  }

  get xpAwarded(): number {
    return this.props.xpAwarded;
  }

  get playedAt(): Date {
    return this.props.playedAt;
  }
}
