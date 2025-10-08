import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav231759953550283 implements MigrationInterface {
    name = 'InitSchemav231759953550283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "notes" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "notes"`);
    }

}
