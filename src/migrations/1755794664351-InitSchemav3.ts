import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav31755794664351 implements MigrationInterface {
    name = 'InitSchemav31755794664351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "bankAccount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "documentUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "bio" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "bio" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "documentUrl" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "bankAccount" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phoneNumber" SET NOT NULL`);
    }

}
