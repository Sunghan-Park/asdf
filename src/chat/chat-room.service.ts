import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entity/chat-room.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
  ) {}

  async createChatRoom(users: User[]) {
    // const chatRoom = await this.chatRoomRepository.create({ users });
    // return this.chatRoomRepository.save(chatRoom);
  }
}
