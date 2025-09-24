import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemav191758730456159 implements MigrationInterface {
    name = 'InitSchemav191758730456159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP CONSTRAINT "FK_b759dbd06af15a814c30796f641"`);
        await queryRunner.query(`ALTER TABLE "rating" ALTER COLUMN "courtId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rating" ADD CONSTRAINT "FK_b759dbd06af15a814c30796f641" FOREIGN KEY ("courtId") REFERENCES "court"("courtId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP CONSTRAINT "FK_b759dbd06af15a814c30796f641"`);
        await queryRunner.query(`ALTER TABLE "rating" ALTER COLUMN "courtId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rating" ADD CONSTRAINT "FK_b759dbd06af15a814c30796f641" FOREIGN KEY ("courtId") REFERENCES "court"("courtId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
