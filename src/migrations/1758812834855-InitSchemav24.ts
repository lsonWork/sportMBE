import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav241758812834855 implements MigrationInterface {
    name = 'InitSchemav241758812834855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avgRating"`);
        await queryRunner.query(`ALTER TABLE "court" ADD "avgRating" numeric(2,1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "avgRating"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avgRating" numeric(2,1)`);
    }

}
