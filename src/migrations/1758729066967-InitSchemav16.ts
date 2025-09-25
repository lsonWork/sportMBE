import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav161758729066967 implements MigrationInterface {
    name = 'InitSchemav161758729066967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" RENAME COLUMN "number" TO "star"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" RENAME COLUMN "star" TO "number"`);
    }

}
