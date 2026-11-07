import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ProgressionTrack } from '../../../domain/game/game-mode';

@Entity({ name: 'user_progressions' })
export class UserProgressionOrmEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @PrimaryColumn({ type: 'text' })
  track: ProgressionTrack;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
