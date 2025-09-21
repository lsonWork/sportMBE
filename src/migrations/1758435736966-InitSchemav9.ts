import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav91758435736966 implements MigrationInterface {
    name = 'InitSchemav91758435736966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lat"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lat" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lng" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lng" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lat"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lat" character varying NOT NULL`);
    }

}
