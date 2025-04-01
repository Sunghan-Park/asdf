import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entity/chat-room.entity';
import { User } from 'src/user/entity/user.entity';
import { Chat } from './entity/chat.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { Participants } from './entity/participants.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, User, Chat, Participants]),
    UserModule,
    AuthModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
