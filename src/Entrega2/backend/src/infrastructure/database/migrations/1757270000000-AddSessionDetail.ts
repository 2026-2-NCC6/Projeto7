import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionDetail1757270000000 implements MigrationInterface {
  name = 'AddSessionDetail1757270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        ADD COLUMN "level" integer NOT NULL DEFAULT 0,
        ADD COLUMN "cleared" boolean NOT NULL DEFAULT false,
        ADD COLUMN "xp_awarded" integer NOT NULL DEFAULT 0,
        ADD COLUMN "avg_response_ms" integer,
        ADD COLUMN "best_response_ms" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        ADD CONSTRAINT "ck_training_sessions_level" CHECK ("level" >= 0),
        ADD CONSTRAINT "ck_training_sessions_xp_awarded" CHECK ("xp_awarded" >= 0),
        ADD CONSTRAINT "ck_training_sessions_avg_response"
          CHECK ("avg_response_ms" IS NULL OR "avg_response_ms" >= 0),
        ADD CONSTRAINT "ck_training_sessions_best_response"
          CHECK ("best_response_ms" IS NULL OR "best_response_ms" >= 0)
    `);

    await queryRunner.query(`
      CREATE INDEX "ix_training_sessions_cleared_level"
        ON "training_sessions" ("user_id", "mode", "level")
        WHERE "cleared"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "ix_training_sessions_cleared_level"`);
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        DROP CONSTRAINT "ck_training_sessions_level",
        DROP CONSTRAINT "ck_training_sessions_xp_awarded",
        DROP CONSTRAINT "ck_training_sessions_avg_response",
        DROP CONSTRAINT "ck_training_sessions_best_response"
    `);
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        DROP COLUMN "level",
        DROP COLUMN "cleared",
        DROP COLUMN "xp_awarded",
        DROP COLUMN "avg_response_ms",
        DROP COLUMN "best_response_ms"
    `);
  }
}
