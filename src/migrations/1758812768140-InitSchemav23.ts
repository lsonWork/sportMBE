import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav231758812768140 implements MigrationInterface {
    name = 'InitSchemav231758812768140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avgRating"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avgRating" numeric(2,1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avgRating"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avgRating" integer`);
    }

}
