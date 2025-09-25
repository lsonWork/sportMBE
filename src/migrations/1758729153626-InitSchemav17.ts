import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav171758729153626 implements MigrationInterface {
    name = 'InitSchemav171758729153626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "star"`);
        await queryRunner.query(`ALTER TABLE "rating" ADD "star" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "star"`);
        await queryRunner.query(`ALTER TABLE "rating" ADD "star" double precision NOT NULL`);
    }

}
