import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import {
  AgeGroup,
  DominantHand,
  PracticeGoal,
  SkillLevel,
} from '../../../domain/user/practitioner-profile';
import { UserRole } from '../../../domain/user/role';

@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'int', name: 'token_version', default: 0 })
  tokenVersion: number;

  @Column({ type: 'text', default: 'player' })
  role: UserRole;

  @Column({ type: 'text', name: 'age_group', nullable: true })
  ageGroup: AgeGroup | null;

  @Column({ type: 'text', name: 'skill_level', nullable: true })
  skillLevel: SkillLevel | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  goals: PracticeGoal[];

  @Column({ type: 'text', name: 'dominant_hand', nullable: true })
  dominantHand: DominantHand | null;

  @Column({ type: 'text', nullable: true })
  restrictions: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
