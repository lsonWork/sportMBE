import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav211758810849167 implements MigrationInterface {
    name = 'InitSchemav211758810849167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" ALTER COLUMN "content" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" ALTER COLUMN "content" SET NOT NULL`);
    }

}
