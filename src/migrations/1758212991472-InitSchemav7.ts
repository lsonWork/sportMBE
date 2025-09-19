import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav71758212991472 implements MigrationInterface {
    name = 'InitSchemav71758212991472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "court" ADD "lat" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "court" ADD "lng" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "courtId"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "courtId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_af1f96549b26bc9eb36f0afbafb" FOREIGN KEY ("courtId") REFERENCES "court"("courtId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_af1f96549b26bc9eb36f0afbafb"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "status" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "courtId"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "courtId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "court" DROP COLUMN "lat"`);
    }

}
