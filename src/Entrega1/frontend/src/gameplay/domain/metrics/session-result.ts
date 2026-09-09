import type { DeviceKind } from '../../../device/contracts';
import type { PlayableModeId } from '../../../types/game';
import type { FailureReason } from '../session-phase';
import type { SessionMetrics } from './session-metrics';

export interface SessionResult {
  readonly mode: PlayableModeId;
  readonly level: number;
  readonly cleared: boolean;
  readonly failureReason: FailureReason | null;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly deviceKind: DeviceKind;
  readonly metrics: SessionMetrics;
}
