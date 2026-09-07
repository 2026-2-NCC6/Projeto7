import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProgressionTables1757260000000 implements MigrationInterface {
  name = 'CreateProgressionTables1757260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_progressions" (
        "user_id" uuid NOT NULL,
        "track" text NOT NULL,
        "level" integer NOT NULL DEFAULT 0,
        "xp" integer NOT NULL DEFAULT 0,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_user_progressions" PRIMARY KEY ("user_id", "track"),
        CONSTRAINT "fk_user_progressions_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "ck_user_progressions_track" CHECK ("track" IN ('color', 'score')),
        CONSTRAINT "ck_user_progressions_level" CHECK ("level" >= 0),
        CONSTRAINT "ck_user_progressions_xp" CHECK ("xp" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "daily_streaks" (
        "user_id" uuid NOT NULL,
        "current_streak" integer NOT NULL DEFAULT 0,
        "longest_streak" integer NOT NULL DEFAULT 0,
        "last_completed_on" date,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_daily_streaks" PRIMARY KEY ("user_id"),
        CONSTRAINT "fk_daily_streaks_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "ck_daily_streaks_current" CHECK ("current_streak" >= 0),
        CONSTRAINT "ck_daily_streaks_longest" CHECK ("longest_streak" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "training_sessions" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "mode" text NOT NULL,
        "score" integer NOT NULL DEFAULT 0,
        "hits" integer NOT NULL DEFAULT 0,
        "misses" integer NOT NULL DEFAULT 0,
        "best_streak" integer NOT NULL DEFAULT 0,
        "duration_ms" integer NOT NULL DEFAULT 0,
        "played_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_training_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "fk_training_sessions_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "ck_training_sessions_mode" CHECK ("mode" IN
          ('level_color', 'level_score', 'infinite_color', 'infinite_score'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "ix_training_sessions_user_played_at"
        ON "training_sessions" ("user_id", "played_at" DESC)
    `);

    await queryRunner.query(`
      INSERT INTO "user_progressions" ("user_id", "track")
      SELECT "id", track FROM "users", (VALUES ('color'), ('score')) AS t(track)
    `);

    await queryRunner.query(`
      INSERT INTO "daily_streaks" ("user_id") SELECT "id" FROM "users"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "training_sessions"`);
    await queryRunner.query(`DROP TABLE "daily_streaks"`);
    await queryRunner.query(`DROP TABLE "user_progressions"`);
  }
}
