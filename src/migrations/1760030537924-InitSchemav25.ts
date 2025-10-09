import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav251760030537924 implements MigrationInterface {
    name = 'InitSchemav251760030537924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "totalPrice" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "totalDeposit"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "totalDeposit" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "totalDeposit"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "totalDeposit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "totalPrice" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" integer NOT NULL`);
    }

}
