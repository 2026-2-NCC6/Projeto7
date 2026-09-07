import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';
import { GameMode } from '../../../domain/game/game-mode';

@Entity({ name: 'training_sessions' })
@Index('ix_training_sessions_user_played_at', ['userId', 'playedAt'])
export class TrainingSessionOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  mode: GameMode;

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

  @CreateDateColumn({ type: 'timestamptz', name: 'played_at' })
  playedAt: Date;
}
