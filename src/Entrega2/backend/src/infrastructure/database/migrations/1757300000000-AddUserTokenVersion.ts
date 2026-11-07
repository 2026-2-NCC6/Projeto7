import { MigrationInterface, QueryRunner } from 'typeorm';

/** Lets the API revoke every token of a user at once, by bumping the version. */
export class AddUserTokenVersion1757300000000 implements MigrationInterface {
  name = 'AddUserTokenVersion1757300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "token_version" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "token_version"`);
  }
}
