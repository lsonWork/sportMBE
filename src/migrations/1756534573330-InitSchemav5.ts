import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav51756534573330 implements MigrationInterface {
    name = 'InitSchemav51756534573330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "advertisement" ADD "status" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "advertisement" DROP COLUMN "status"`);
    }

}
