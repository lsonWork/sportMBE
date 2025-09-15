import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav61757258002831 implements MigrationInterface {
    name = 'InitSchemav61757258002831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "request_update" ("requestUpdateId" uuid NOT NULL DEFAULT uuid_generate_v4(), "documentUrl" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "status" boolean NOT NULL, "userId" uuid, CONSTRAINT "PK_628f81f9d95f5d724fcdde123dd" PRIMARY KEY ("requestUpdateId"))`);
        await queryRunner.query(`ALTER TABLE "advertisement" ADD "displayOrder" character varying`);
        await queryRunner.query(`ALTER TABLE "advertisement" ADD "displayHome" boolean`);
        await queryRunner.query(`ALTER TABLE "request_update" ADD CONSTRAINT "FK_b629c7c71e9cd1c1c71beb13eb1" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_update" DROP CONSTRAINT "FK_b629c7c71e9cd1c1c71beb13eb1"`);
        await queryRunner.query(`ALTER TABLE "advertisement" DROP COLUMN "displayHome"`);
        await queryRunner.query(`ALTER TABLE "advertisement" DROP COLUMN "displayOrder"`);
        await queryRunner.query(`DROP TABLE "request_update"`);
    }

}
