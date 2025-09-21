import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav101758437596142 implements MigrationInterface {
    name = 'InitSchemav101758437596142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lat"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lat" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lng" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lng" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lat"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lat" integer NOT NULL`);
    }

}
