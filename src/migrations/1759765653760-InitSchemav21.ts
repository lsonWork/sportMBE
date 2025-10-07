import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav211759765653760 implements MigrationInterface {
    name = 'InitSchemav211759765653760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payment" ("paymentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL, "paymentMethod" character varying NOT NULL, "paymentStatus" character varying NOT NULL, "transactionCode" character varying NOT NULL, "userId" uuid, "bookingOrderOrderId" uuid, CONSTRAINT "PK_67ee4523b649947b6a7954dc673" PRIMARY KEY ("paymentId"))`);
        await queryRunner.query(`CREATE TABLE "booking_order" ("orderId" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalPrice" integer NOT NULL, "totalDeposit" integer NOT NULL, "status" character varying NOT NULL, "userUserId" uuid, CONSTRAINT "PK_c76c2e4397bec8c89d73c6061ea" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "bookingOrderOrderId" uuid`);
        await queryRunner.query(`ALTER TABLE "rating" ALTER COLUMN "content" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_b046318e0b341a7f72110b75857" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_9c231f822effcc22254b6e7fa41" FOREIGN KEY ("bookingOrderOrderId") REFERENCES "booking_order"("orderId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_order" ADD CONSTRAINT "FK_06e05ad0d39eb7df2c048e09576" FOREIGN KEY ("userUserId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_0b144be288991211c5ea4aa816b" FOREIGN KEY ("bookingOrderOrderId") REFERENCES "booking_order"("orderId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_0b144be288991211c5ea4aa816b"`);
        await queryRunner.query(`ALTER TABLE "booking_order" DROP CONSTRAINT "FK_06e05ad0d39eb7df2c048e09576"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_9c231f822effcc22254b6e7fa41"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_b046318e0b341a7f72110b75857"`);
        await queryRunner.query(`ALTER TABLE "rating" ALTER COLUMN "content" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "bookingOrderOrderId"`);
        await queryRunner.query(`DROP TABLE "booking_order"`);
        await queryRunner.query(`DROP TABLE "payment"`);
    }

}
