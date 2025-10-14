import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchemav261760466732352 implements MigrationInterface {
  // Tên class sẽ khác

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Bước 1: Tạo bảng mới 'owner_payment_info'
    await queryRunner.query(`
            CREATE TABLE "owner_payment_info" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "accountName" character varying, 
                "accountNumber" character varying, 
                "bankName" character varying, 
                "qrCodeUrl" text, 
                "userId" uuid, 
                CONSTRAINT "REL_some_unique_constraint_name" UNIQUE ("userId"), 
                CONSTRAINT "PK_some_primary_key_name" PRIMARY KEY ("id")
            )
        `);

    // Thêm khóa ngoại
    await queryRunner.query(`
            ALTER TABLE "owner_payment_info" 
            ADD CONSTRAINT "FK_user_payment_info" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("userId") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    // Bước 2: Sao chép dữ liệu từ cột 'bankAccount' cũ sang bảng mới
    // Giả định rằng chuỗi cũ "STK + Ngân hàng" sẽ được lưu tạm vào cột 'accountNumber'
    await queryRunner.query(`
            INSERT INTO "owner_payment_info" ("userId", "accountNumber")
            SELECT "userId", "bankAccount"
            FROM "user"
            WHERE "bankAccount" IS NOT NULL AND "bankAccount" != '' AND "role" = 'OWNER'
        `);

    // Bước 3: Xóa cột cũ khỏi bảng 'user' sau khi đã sao chép an toàn
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bankAccount"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // (Để rollback, chúng ta sẽ thêm lại cột và xóa bảng mới, nhưng dữ liệu chi tiết sẽ khó phục hồi)
    await queryRunner.query(
      `ALTER TABLE "user" ADD "bankAccount" character varying`,
    );
    await queryRunner.query(`DROP TABLE "owner_payment_info"`);
  }
}
