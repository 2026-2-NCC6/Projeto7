export interface DailyStreakProps {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedOn: string | null;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class DailyStreak {
  private constructor(private readonly props: DailyStreakProps) {}

  static restore(props: DailyStreakProps): DailyStreak {
    return new DailyStreak(props);
  }

  static start(userId: string): DailyStreak {
    return new DailyStreak({ userId, currentStreak: 0, longestStreak: 0, lastCompletedOn: null });
  }

  get userId(): string {
    return this.props.userId;
  }

  get currentStreak(): number {
    return this.props.currentStreak;
  }

  get longestStreak(): number {
    return this.props.longestStreak;
  }

  get lastCompletedOn(): string | null {
    return this.props.lastCompletedOn;
  }

  isCompletedOn(day: Date): boolean {
    return this.props.lastCompletedOn === toIsoDate(day);
  }
}
