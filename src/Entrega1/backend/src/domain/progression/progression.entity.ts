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

  award(xp: number): Progression {
    let level = this.props.level;
    let carried = this.props.xp + Math.max(0, xp);

    while (carried >= xpRequiredForLevel(level)) {
      carried -= xpRequiredForLevel(level);
      level += 1;
    }

    return new Progression({ ...this.props, level, xp: carried });
  }
}

export function highestLevelOf(progressions: Progression[], track?: ProgressionTrack): number {
  return progressions
    .filter((progression) => track === undefined || progression.track === track)
    .reduce((highest, progression) => Math.max(highest, progression.level), 0);
}
