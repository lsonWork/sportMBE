import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav151758728473023 implements MigrationInterface {
    name = 'InitSchemav151758728473023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" ADD "createdAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rating" ADD "ownerId" uuid`);
        await queryRunner.query(`ALTER TABLE "rating" ADD CONSTRAINT "FK_bed06dd53754fe32d6f28ed4cd9" FOREIGN KEY ("ownerId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP CONSTRAINT "FK_bed06dd53754fe32d6f28ed4cd9"`);
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "createdAt"`);
    }

}
