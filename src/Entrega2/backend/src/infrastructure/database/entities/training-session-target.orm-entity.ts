import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'training_session_targets' })
export class TrainingSessionTargetOrmEntity {
  @PrimaryColumn({ type: 'uuid', name: 'session_id' })
  sessionId: string;

  @PrimaryColumn({ type: 'smallint', name: 'target_id' })
  targetId: number;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'int', name: 'correct_hits', default: 0 })
  correctHits: number;

  @Column({ type: 'int', name: 'impact_avg', nullable: true })
  impactAverage: number | null;

  @Column({ type: 'int', name: 'impact_peak', nullable: true })
  impactPeak: number | null;
}
