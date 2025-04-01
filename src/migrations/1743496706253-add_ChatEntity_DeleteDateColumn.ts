import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatEntityDeleteDateColumn1743496706253 implements MigrationInterface {
    name = 'AddChatEntityDeleteDateColumn1743496706253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "deletedAt"`);
    }

}
