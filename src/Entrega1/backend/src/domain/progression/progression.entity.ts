import { ProgressionTrack } from '../game/game-mode';
import { xpRequiredForLevel } from './level-rules';

export interface ProgressionProps {
  userId: string;
  track: ProgressionTrack;
  level: number;
  xp: number;
}

export class Progression {
  private constructor(private readonly props: ProgressionProps) {}

  static restore(props: ProgressionProps): Progression {
    return new Progression(props);
  }

  static start(userId: string, track: ProgressionTrack): Progression {
    return new Progression({ userId, track, level: 0, xp: 0 });
  }

  get userId(): string {
    return this.props.userId;
  }

  get track(): ProgressionTrack {
    return this.props.track;
  }

  get level(): number {
    return this.props.level;
  }

  get xp(): number {
    return this.props.xp;
  }

  get xpRequired(): number {
    return xpRequiredForLevel(this.props.level);
  }
}

export function highestLevelOf(progressions: Progression[], track?: ProgressionTrack): number {
  return progressions
    .filter((progression) => track === undefined || progression.track === track)
    .reduce((highest, progression) => Math.max(highest, progression.level), 0);
}
