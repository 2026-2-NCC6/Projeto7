import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionTelemetry1757280000000 implements MigrationInterface {
  name = 'AddSessionTelemetry1757280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        ADD COLUMN "device_kind" text NOT NULL DEFAULT 'simulated',
        ADD CONSTRAINT "ck_training_sessions_device_kind"
          CHECK ("device_kind" IN ('simulated', 'websocket'))
    `);

    await queryRunner.query(`
      CREATE TABLE "training_session_targets" (
        "session_id" uuid NOT NULL,
        "target_id" smallint NOT NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "correct_hits" integer NOT NULL DEFAULT 0,
        "impact_avg" integer,
        "impact_peak" integer,
        CONSTRAINT "pk_training_session_targets" PRIMARY KEY ("session_id", "target_id"),
        CONSTRAINT "fk_training_session_targets_session" FOREIGN KEY ("session_id")
          REFERENCES "training_sessions" ("id") ON DELETE CASCADE,
        CONSTRAINT "ck_training_session_targets_target" CHECK ("target_id" BETWEEN 1 AND 9),
        CONSTRAINT "ck_training_session_targets_attempts" CHECK ("attempts" >= 0),
        CONSTRAINT "ck_training_session_targets_correct"
          CHECK ("correct_hits" >= 0 AND "correct_hits" <= "attempts"),
        CONSTRAINT "ck_training_session_targets_impact_avg"
          CHECK ("impact_avg" IS NULL OR "impact_avg" BETWEEN 0 AND 4095),
        CONSTRAINT "ck_training_session_targets_impact_peak"
          CHECK ("impact_peak" IS NULL OR "impact_peak" BETWEEN 0 AND 4095)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "training_session_targets"`);
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        DROP CONSTRAINT "ck_training_sessions_device_kind",
        DROP COLUMN "device_kind"
    `);
  }
}
