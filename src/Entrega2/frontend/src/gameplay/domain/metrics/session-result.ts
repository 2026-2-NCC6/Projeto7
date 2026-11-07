import type { DeviceKind } from '../../../device/contracts';
import type { PlayableModeId } from '../../../types/game';
import type { TrainingRef } from '../../training/training-run';
import type { FailureReason } from '../session-phase';
import type { AttemptRecord } from './attempt-record';
import type { SessionMetrics } from './session-metrics';

export interface SessionInterruptions {
  readonly pauses: number;
  readonly deviceLosses: number;
  readonly faults: number;
}

export interface SessionResult {
  readonly mode: PlayableModeId;
  readonly level: number;
  readonly cleared: boolean;
  readonly failureReason: FailureReason | null;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly deviceKind: DeviceKind;
  readonly metrics: SessionMetrics;
  readonly training: TrainingRef | null;
  readonly stopReason: string | null;
  readonly interruptions: SessionInterruptions;
  readonly deviceId: string | null;
  readonly records: readonly AttemptRecord[];
}
