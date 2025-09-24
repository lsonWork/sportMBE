import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav151758725987365 implements MigrationInterface {
    name = 'InitSchemav151758725987365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rating" ("ratingId" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" double precision NOT NULL, "courtId" uuid, CONSTRAINT "PK_d32cecfa3fc35a981b31c55f739" PRIMARY KEY ("ratingId"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "birthDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "gender" boolean`);
        await queryRunner.query(`ALTER TABLE "rating" ADD CONSTRAINT "FK_b759dbd06af15a814c30796f641" FOREIGN KEY ("courtId") REFERENCES "court"("courtId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP CONSTRAINT "FK_b759dbd06af15a814c30796f641"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birthDate"`);
        await queryRunner.query(`DROP TABLE "rating"`);
    }

}
