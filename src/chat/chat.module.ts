import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRoomService } from './chat-room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entity/chat-room.entity';
import { User } from 'src/user/entities/user.entity';
import { Chat } from './entity/chat.entity';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, User, Chat]), UserModule],
  providers: [ChatGateway, ChatService, ChatRoomService],
  exports: [ChatRoomService],
})
export class ChatModule {}
