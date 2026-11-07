import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The wall went from a 3×3 grid to a 3×2 one. Targets 7..9 no longer exist, and
 * the rows recorded for them came from the simulator, so they are dropped.
 */
export class ShrinkWallToSixTargets1757290000000 implements MigrationInterface {
  name = 'ShrinkWallToSixTargets1757290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "training_session_targets" WHERE "target_id" > 6`);
    await queryRunner.query(`
      ALTER TABLE "training_session_targets"
        DROP CONSTRAINT "ck_training_session_targets_target",
        ADD CONSTRAINT "ck_training_session_targets_target" CHECK ("target_id" BETWEEN 1 AND 6)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The deleted rows do not come back: only the constraint is restored.
    await queryRunner.query(`
      ALTER TABLE "training_session_targets"
        DROP CONSTRAINT "ck_training_session_targets_target",
        ADD CONSTRAINT "ck_training_session_targets_target" CHECK ("target_id" BETWEEN 1 AND 9)
    `);
  }
}
