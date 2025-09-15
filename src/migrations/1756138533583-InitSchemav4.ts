import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav41756138533583 implements MigrationInterface {
    name = 'InitSchemav41756138533583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sport_type" ADD "status" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sport_type" DROP COLUMN "status"`);
    }

}
