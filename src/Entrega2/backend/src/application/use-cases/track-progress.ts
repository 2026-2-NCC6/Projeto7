import { ProgressionTrack } from '../../domain/game/game-mode';
import { Progression } from '../../domain/progression/progression.entity';

export interface TrackProgressView {
  track: ProgressionTrack;
  level: number;
  xp: number;
  xpRequired: number;
}

export function toTrackProgressView(progression: Progression): TrackProgressView {
  return {
    track: progression.track,
    level: progression.level,
    xp: progression.xp,
    xpRequired: progression.xpRequired,
  };
}
