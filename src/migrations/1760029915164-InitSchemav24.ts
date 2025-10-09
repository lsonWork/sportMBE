import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav241760029915164 implements MigrationInterface {
    name = 'InitSchemav241760029915164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "totalPrice" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "deposit"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "deposit" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "deposit"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "deposit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "totalPrice" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "notes" character varying NOT NULL`);
    }

}
