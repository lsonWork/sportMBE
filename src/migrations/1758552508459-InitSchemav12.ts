import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav121758552508459 implements MigrationInterface {
    name = 'InitSchemav121758552508459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sport_type" ADD CONSTRAINT "UQ_2c6c293c7df0504d0d6f8dc30af" UNIQUE ("typeName")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sport_type" DROP CONSTRAINT "UQ_2c6c293c7df0504d0d6f8dc30af"`);
    }

}
