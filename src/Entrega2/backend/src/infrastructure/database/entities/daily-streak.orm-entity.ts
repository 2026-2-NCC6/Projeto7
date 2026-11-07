import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'daily_streaks' })
export class DailyStreakOrmEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'int', name: 'current_streak', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', name: 'longest_streak', default: 0 })
  longestStreak: number;

  @Column({ type: 'date', name: 'last_completed_on', nullable: true })
  lastCompletedOn: string | null;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
