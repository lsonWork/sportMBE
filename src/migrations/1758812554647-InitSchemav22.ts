import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav221758812554647 implements MigrationInterface {
    name = 'InitSchemav221758812554647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "avgRating" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avgRating"`);
    }

}
