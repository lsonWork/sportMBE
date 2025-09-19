import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav81758258172387 implements MigrationInterface {
    name = 'InitSchemav81758258172387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "booking_invitee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bookingBookingId" uuid, "userUserId" uuid, CONSTRAINT "PK_b931d5a550477a16f49742dbf0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "inviteId"`);
        await queryRunner.query(`ALTER TABLE "booking_invitee" ADD CONSTRAINT "FK_70ed9d9ac446c41ade6d02f9bc0" FOREIGN KEY ("bookingBookingId") REFERENCES "booking"("bookingId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_invitee" ADD CONSTRAINT "FK_f42b37e1381ef9f94f817135982" FOREIGN KEY ("userUserId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_invitee" DROP CONSTRAINT "FK_f42b37e1381ef9f94f817135982"`);
        await queryRunner.query(`ALTER TABLE "booking_invitee" DROP CONSTRAINT "FK_70ed9d9ac446c41ade6d02f9bc0"`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "inviteId" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "booking_invitee"`);
    }

}
