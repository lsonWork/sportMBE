import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1755704901584 implements MigrationInterface {
  name = 'InitSchema1755704901584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "advertisement" ("advertisementId" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "imageUrl" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "ownerId" uuid, CONSTRAINT "PK_085c409b75c59a710802db510da" PRIMARY KEY ("advertisementId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "court_image" ("imageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "imageUrl" character varying NOT NULL, "courtId" uuid, CONSTRAINT "PK_98700cb57bfd0d00bcaed9d8571" PRIMARY KEY ("imageId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sport_type" ("sportTypeId" uuid NOT NULL DEFAULT uuid_generate_v4(), "typeName" character varying NOT NULL, CONSTRAINT "PK_c00c178e9399b226ffce13056f1" PRIMARY KEY ("sportTypeId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback" ("feedbackId" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "courtId" uuid, "ownerId" uuid, CONSTRAINT "PK_3b500d42f7115ffdbfd1190b2e0" PRIMARY KEY ("feedbackId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "court" ("courtId" uuid NOT NULL DEFAULT uuid_generate_v4(), "courtName" character varying NOT NULL, "address" character varying NOT NULL, "description" character varying NOT NULL, "pricePerHour" integer NOT NULL, "isActive" boolean NOT NULL, "subService" character varying NOT NULL, "ownerId" uuid, "sportTypeId" uuid, CONSTRAINT "PK_de0f5d9fd8114033d7466081853" PRIMARY KEY ("courtId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("notificationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_34ecf236e96be76a41929c131b7" PRIMARY KEY ("notificationId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment" ("paymentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL, "paymentMethod" character varying NOT NULL, "paymentStatus" character varying NOT NULL, "transactionCode" character varying NOT NULL, "userId" uuid, "bookingId" uuid, CONSTRAINT "REL_5738278c92c15e1ec9d27e3a09" UNIQUE ("bookingId"), CONSTRAINT "PK_67ee4523b649947b6a7954dc673" PRIMARY KEY ("paymentId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking" ("bookingId" uuid NOT NULL DEFAULT uuid_generate_v4(), "courtId" character varying NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "totalPrice" integer NOT NULL, "status" boolean NOT NULL, "deposit" integer NOT NULL, "bookingDate" TIMESTAMP NOT NULL, "inviteId" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_2aa4ef0259b62eadae336c6df1d" PRIMARY KEY ("bookingId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "password" character varying NOT NULL, "avatarUrl" character varying NOT NULL, "status" boolean NOT NULL, "role" character varying NOT NULL, "bankAccount" character varying NOT NULL, "documentUrl" character varying NOT NULL, "bio" character varying NOT NULL, CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription" ("subscriptionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price" integer NOT NULL, "duration" integer NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_13cecd7da6abc7ae934d8560bef" PRIMARY KEY ("subscriptionId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_subscription" ("userSubscriptionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "status" character varying NOT NULL, "paymentId" character varying NOT NULL, "userId" uuid, "subscriptionId" uuid, CONSTRAINT "PK_2e8fee1c75d3e8cd51fce257a98" PRIMARY KEY ("userSubscriptionId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "friend_request" ("friendRequestId" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromId" character varying NOT NULL, "toId" character varying NOT NULL, "status" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_e0272e17d99a65aa8e7c5d85668" PRIMARY KEY ("friendRequestId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "advertisement" ADD CONSTRAINT "FK_5e98d72fca853ab3e4846dc648e" FOREIGN KEY ("ownerId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "court_image" ADD CONSTRAINT "FK_e036b928b303a63f12f1ec778ce" FOREIGN KEY ("courtId") REFERENCES "court"("courtId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_3817fd9f02ed4ff01fbe22de821" FOREIGN KEY ("courtId") REFERENCES "court"("courtId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_b303a63e926fa293cde24b73fd8" FOREIGN KEY ("ownerId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "court" ADD CONSTRAINT "FK_37d120083413034770c8882bc8a" FOREIGN KEY ("ownerId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "court" ADD CONSTRAINT "FK_927ab2377ca95024b10fd1c8eaf" FOREIGN KEY ("sportTypeId") REFERENCES "sport_type"("sportTypeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_b046318e0b341a7f72110b75857" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_5738278c92c15e1ec9d27e3a098" FOREIGN KEY ("bookingId") REFERENCES "booking"("bookingId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_336b3f4a235460dc93645fbf222" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_403d98d1638533c09f9b185929b" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_a7575d9d46b42a9d7f275be1ec4" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("subscriptionId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_a7575d9d46b42a9d7f275be1ec4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_403d98d1638533c09f9b185929b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_336b3f4a235460dc93645fbf222"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_5738278c92c15e1ec9d27e3a098"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_b046318e0b341a7f72110b75857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "court" DROP CONSTRAINT "FK_927ab2377ca95024b10fd1c8eaf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "court" DROP CONSTRAINT "FK_37d120083413034770c8882bc8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" DROP CONSTRAINT "FK_b303a63e926fa293cde24b73fd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" DROP CONSTRAINT "FK_3817fd9f02ed4ff01fbe22de821"`,
    );
    await queryRunner.query(
      `ALTER TABLE "court_image" DROP CONSTRAINT "FK_e036b928b303a63f12f1ec778ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "advertisement" DROP CONSTRAINT "FK_5e98d72fca853ab3e4846dc648e"`,
    );
    await queryRunner.query(`DROP TABLE "friend_request"`);
    await queryRunner.query(`DROP TABLE "user_subscription"`);
    await queryRunner.query(`DROP TABLE "subscription"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "court"`);
    await queryRunner.query(`DROP TABLE "feedback"`);
    await queryRunner.query(`DROP TABLE "sport_type"`);
    await queryRunner.query(`DROP TABLE "court_image"`);
    await queryRunner.query(`DROP TABLE "advertisement"`);
  }
}
