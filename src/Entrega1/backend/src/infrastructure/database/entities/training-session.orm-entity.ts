import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { GameMode } from '../../../domain/game/game-mode';
import { DeviceKind } from '../../../domain/training-session/device-kind';
import { EndReason } from '../../../domain/training-session/session-context';

@Entity({ name: 'training_sessions' })
@Index('ix_training_sessions_user_played_at', ['userId', 'playedAt'])
export class TrainingSessionOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'ticket_id', nullable: true, unique: true })
  ticketId: string | null;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  mode: GameMode;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'boolean', default: false })
  cleared: boolean;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  hits: number;

  @Column({ type: 'int', default: 0 })
  misses: number;

  @Column({ type: 'int', name: 'best_streak', default: 0 })
  bestStreak: number;

  @Column({ type: 'int', name: 'duration_ms', default: 0 })
  durationMs: number;

  @Column({ type: 'int', name: 'xp_awarded', default: 0 })
  xpAwarded: number;

  @Column({ type: 'int', name: 'avg_response_ms', nullable: true })
  avgResponseMs: number | null;

  @Column({ type: 'int', name: 'best_response_ms', nullable: true })
  bestResponseMs: number | null;

  @Column({ type: 'text', name: 'device_kind', default: 'simulated' })
  deviceKind: DeviceKind;

  @Column({ type: 'uuid', name: 'training_id', nullable: true })
  trainingId: string | null;

  @Column({ type: 'int', name: 'training_version', nullable: true })
  trainingVersion: number | null;

  @Column({ type: 'int', name: 'step_index', nullable: true })
  stepIndex: number | null;

  @Column({ type: 'text', name: 'end_reason', nullable: true })
  endReason: EndReason | null;

  @Column({ type: 'text', name: 'stop_reason', nullable: true })
  stopReason: string | null;

  @Column({ type: 'int', default: 0 })
  pauses: number;

  @Column({ type: 'int', name: 'device_losses', default: 0 })
  deviceLosses: number;

  @Column({ type: 'int', default: 0 })
  faults: number;

  @Column({ type: 'boolean', default: false })
  offline: boolean;

  @Column({ type: 'uuid', name: 'client_session_id', nullable: true })
  clientSessionId: string | null;

  @Column({ type: 'text', name: 'device_id', nullable: true })
  deviceId: string | null;

  @Column({ type: 'timestamptz', name: 'played_at', default: () => 'now()' })
  playedAt: Date;
}
