import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Each recorded session points at the ticket it was opened with. The unique
 * constraint is what makes a ticket good for one result only, even when two
 * requests race.
 */
export class AddSessionTicket1757310000000 implements MigrationInterface {
  name = 'AddSessionTicket1757310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        ADD COLUMN "ticket_id" uuid,
        ADD CONSTRAINT "uq_training_sessions_ticket" UNIQUE ("ticket_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "training_sessions"
        DROP CONSTRAINT "uq_training_sessions_ticket",
        DROP COLUMN "ticket_id"
    `);
  }
}
