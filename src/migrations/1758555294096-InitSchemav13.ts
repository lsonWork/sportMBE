import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav131758555294096 implements MigrationInterface {
    name = 'InitSchemav131758555294096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "advertisement" ADD "createdAt" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "advertisement" DROP COLUMN "createdAt"`);
    }

}
