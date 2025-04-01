import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1743455637377 implements MigrationInterface {
    name = 'Initial1743455637377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "participants" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "id" SERIAL NOT NULL, "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), "chatRoomId" integer, "userId" integer, CONSTRAINT "PK_1cda06c31eec1c95b3365a0283f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "receiverId"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "roomId"`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "message" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_c2b21d8086193c56faafaf1b97c"`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "senderId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "participants" ADD CONSTRAINT "FK_877279155365e420eae9b92589f" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participants" ADD CONSTRAINT "FK_5fc9cddc801b973cd9edcdda42a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_c2b21d8086193c56faafaf1b97c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_c2b21d8086193c56faafaf1b97c"`);
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_5fc9cddc801b973cd9edcdda42a"`);
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_877279155365e420eae9b92589f"`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "senderId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_c2b21d8086193c56faafaf1b97c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "roomId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "content" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "receiverId" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "participants"`);
    }

}
