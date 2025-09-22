import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav111758450251402 implements MigrationInterface {
    name = 'InitSchemav111758450251402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "fromId"`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "fromId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "toId"`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "toId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_533e5b3ecd50892bbccf1616810" FOREIGN KEY ("fromId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_6e9401b444592fb67370788828e" FOREIGN KEY ("toId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_6e9401b444592fb67370788828e"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_533e5b3ecd50892bbccf1616810"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "toId"`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "toId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "fromId"`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "fromId" character varying NOT NULL`);
    }

}
