import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav201758732240857 implements MigrationInterface {
    name = 'InitSchemav201758732240857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" ADD "content" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "content"`);
    }

}
