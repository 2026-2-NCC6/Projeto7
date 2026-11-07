import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingPlatform1757320000000 implements MigrationInterface {
  name = 'AddTrainingPlatform1757320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "role" text NOT NULL DEFAULT 'player'
          CONSTRAINT "ck_users_role" CHECK ("role" IN ('player', 'coach', 'admin')),
        ADD COLUMN "age_group" text
          CONSTRAINT "ck_users_age_group" CHECK ("age_group" IN ('child', 'teen', 'adult', 'senior')),
        ADD COLUMN "skill_level" text
          CONSTRAINT "ck_users_skill_level" CHECK ("skill_level" IN ('beginner', 'intermediate', 'advanced')),
        ADD COLUMN "goals" text[] NOT NULL DEFAULT '{}',
        ADD COLUMN "dominant_hand" text
          CONSTRAINT "ck_users_dominant_hand" CHECK ("dominant_hand" IN ('right', 'left')),
        ADD COLUMN "restrictions" text
    `);

    await queryRunner.query(`
      CREATE TABLE "trainings" (
        "id" uuid PRIMARY KEY,
        "author_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "status" text NOT NULL
          CONSTRAINT "ck_trainings_status" CHECK ("status" IN ('draft', 'in_review', 'published', 'archived')),
        "draft" jsonb NOT NULL,
        "revision" int NOT NULL,
        "simulated_revision" int,
        "published_revision" int,
        "current_version" int NOT NULL DEFAULT 0,
        "review_note" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "published_at" timestamptz
      )
    `);
    await queryRunner.query(`CREATE INDEX "ix_trainings_author" ON "trainings" ("author_id")`);

    await queryRunner.query(`
      CREATE TABLE "training_versions" (
        "training_id" uuid NOT NULL REFERENCES "trainings" ("id") ON DELETE CASCADE,
        "version" int NOT NULL,
        "content" jsonb NOT NULL,
        "published_at" timestamptz NOT NULL,
        "published_by" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
        "change_note" text NOT NULL DEFAULT '',
        PRIMARY KEY ("training_id", "version")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        ADD COLUMN "training_id" uuid REFERENCES "trainings" ("id") ON DELETE SET NULL,
        ADD COLUMN "training_version" int,
        ADD COLUMN "step_index" int,
        ADD COLUMN "end_reason" text,
        ADD COLUMN "stop_reason" text,
        ADD COLUMN "pauses" int NOT NULL DEFAULT 0,
        ADD COLUMN "device_losses" int NOT NULL DEFAULT 0,
        ADD COLUMN "faults" int NOT NULL DEFAULT 0,
        ADD COLUMN "offline" boolean NOT NULL DEFAULT false,
        ADD COLUMN "client_session_id" uuid,
        ADD COLUMN "device_id" text,
        ADD CONSTRAINT "uq_training_sessions_client" UNIQUE ("user_id", "client_session_id")
    `);
    await queryRunner.query(
      `CREATE INDEX "ix_training_sessions_training" ON "training_sessions" ("training_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "training_session_attempts" (
        "session_id" uuid NOT NULL REFERENCES "training_sessions" ("id") ON DELETE CASCADE,
        "seq" int NOT NULL,
        "at_ms" int NOT NULL,
        "response_ms" int NOT NULL,
        "verdict" text NOT NULL,
        "target_id" smallint,
        "score_delta" int NOT NULL,
        "intensity" int,
        PRIMARY KEY ("session_id", "seq")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_events" (
        "id" uuid PRIMARY KEY,
        "at" timestamptz NOT NULL DEFAULT now(),
        "actor_id" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
        "action" text NOT NULL,
        "outcome" text NOT NULL,
        "target_type" text,
        "target_id" text,
        "details" jsonb NOT NULL DEFAULT '{}',
        "ip" text
      )
    `);
    await queryRunner.query(`CREATE INDEX "ix_audit_events_at" ON "audit_events" ("at" DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_events"`);
    await queryRunner.query(`DROP TABLE "training_session_attempts"`);
    await queryRunner.query(`DROP INDEX "ix_training_sessions_training"`);
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        DROP CONSTRAINT "uq_training_sessions_client",
        DROP COLUMN "device_id",
        DROP COLUMN "client_session_id",
        DROP COLUMN "offline",
        DROP COLUMN "faults",
        DROP COLUMN "device_losses",
        DROP COLUMN "pauses",
        DROP COLUMN "stop_reason",
        DROP COLUMN "end_reason",
        DROP COLUMN "step_index",
        DROP COLUMN "training_version",
        DROP COLUMN "training_id"
    `);
    await queryRunner.query(`DROP TABLE "training_versions"`);
    await queryRunner.query(`DROP TABLE "trainings"`);
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "restrictions",
        DROP COLUMN "dominant_hand",
        DROP COLUMN "goals",
        DROP COLUMN "skill_level",
        DROP COLUMN "age_group",
        DROP COLUMN "role"
    `);
  }
}
