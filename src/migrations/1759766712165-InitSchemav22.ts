import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav221759766712165 implements MigrationInterface {
    name = 'InitSchemav221759766712165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_9c231f822effcc22254b6e7fa41"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "bookingOrderOrderId" TO "bookingOrderId"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."booking_order_status_enum" AS ENUM('PENDING_DEPOSIT', 'CONFIRMED', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "status" "public"."booking_order_status_enum" NOT NULL DEFAULT 'PENDING_DEPOSIT'`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_2a4f05afe0630bd337737843b59" FOREIGN KEY ("bookingOrderId") REFERENCES "booking_order"("orderId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_2a4f05afe0630bd337737843b59"`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."booking_order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "bookingOrderId" TO "bookingOrderOrderId"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_9c231f822effcc22254b6e7fa41" FOREIGN KEY ("bookingOrderOrderId") REFERENCES "booking_order"("orderId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
