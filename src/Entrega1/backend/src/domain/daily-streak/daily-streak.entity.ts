export interface DailyStreakProps {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedOn: string | null;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function previousIsoDate(date: Date): string {
  return toIsoDate(new Date(date.getTime() - ONE_DAY_MS));
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

  completeOn(day: Date): DailyStreak {
    if (this.isCompletedOn(day)) {
      return this;
    }

    const currentStreak =
      this.props.lastCompletedOn === previousIsoDate(day) ? this.props.currentStreak + 1 : 1;

    return new DailyStreak({
      ...this.props,
      currentStreak,
      longestStreak: Math.max(this.props.longestStreak, currentStreak),
      lastCompletedOn: toIsoDate(day),
    });
  }
}
