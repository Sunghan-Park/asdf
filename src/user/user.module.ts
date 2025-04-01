import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { HashingService } from 'src/hash/hashing.service';
import { BcryptService } from 'src/hash/bcrypt.service';
import { ChatRoom } from 'src/chat/entity/chat-room.entity';
import { Chat } from 'src/chat/entity/chat.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, ChatRoom, Chat])],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: HashingService, useClass: BcryptService },
  ],
  exports: [UserService],
})
export class UserModule {}
