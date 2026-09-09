import type { ImpactReading, TargetId } from '../../../device/contracts';
import type { TargetColor } from '../../../types/game';
import type { HitVerdict } from '../session-phase';

/**
 * One attempt in a session. `targetId` is null when the attempt is a missed
 * reaction window — the player never hit anything, and there is no reading.
 */
export interface AttemptRecord {
  readonly atMs: number;
  readonly responseMs: number;
  readonly verdict: HitVerdict;
  readonly targetId: TargetId | null;
  readonly color: TargetColor | null;
  readonly scoreDelta: number;
  readonly impact: ImpactReading | null;
}
