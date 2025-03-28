import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1743155321128 implements MigrationInterface {
    name = 'Initial1743155321128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat_room" ("id" SERIAL NOT NULL, CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_chat_rooms_chat_room" ("userId" integer NOT NULL, "chatRoomId" integer NOT NULL, CONSTRAINT "PK_7c9b5b59aac6301b9a6ceb2dd65" PRIMARY KEY ("userId", "chatRoomId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5b607f24abdf6c1c1773c47c2f" ON "user_chat_rooms_chat_room" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9f89dcbedf03d7364aac612189" ON "user_chat_rooms_chat_room" ("chatRoomId") `);
        await queryRunner.query(`ALTER TABLE "chat" ADD "chatRoomId" integer`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_e49029a11d5d42ae8a5dd9919a2" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_c2b21d8086193c56faafaf1b97c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_chat_rooms_chat_room" ADD CONSTRAINT "FK_5b607f24abdf6c1c1773c47c2fb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_chat_rooms_chat_room" ADD CONSTRAINT "FK_9f89dcbedf03d7364aac6121899" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_chat_rooms_chat_room" DROP CONSTRAINT "FK_9f89dcbedf03d7364aac6121899"`);
        await queryRunner.query(`ALTER TABLE "user_chat_rooms_chat_room" DROP CONSTRAINT "FK_5b607f24abdf6c1c1773c47c2fb"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_c2b21d8086193c56faafaf1b97c"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_e49029a11d5d42ae8a5dd9919a2"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "chatRoomId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9f89dcbedf03d7364aac612189"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b607f24abdf6c1c1773c47c2f"`);
        await queryRunner.query(`DROP TABLE "user_chat_rooms_chat_room"`);
        await queryRunner.query(`DROP TABLE "chat_room"`);
    }

}
