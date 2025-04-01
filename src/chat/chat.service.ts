import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JoinChatRoomDto } from './dto/join-chat-room.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatRoom } from './entity/chat-room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { User } from 'src/user/entity/user.entity';
import { Participants } from './entity/participants.entity';
import { Chat } from './entity/chat.entity';
import { EditMessageDto } from './dto/edit-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Participants)
    private participantsRepository: Repository<Participants>,
    private userService: UserService,
  ) {}

  async joinChatRoom(joinChatRoomDto: JoinChatRoomDto, user: User) {
    const { chatRoomId } = joinChatRoomDto;

    const chatRoom = await this.findChatRoomById(chatRoomId, [
      'participants',
      'participants.user',
    ]);
    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${chatRoomId} not found`);
    }

    // 참여자로 등록되어 있는지 확인
    const isRegisteredParticipant = await this.participantsRepository.findOne({
      where: {
        chatRoom: { id: chatRoomId },
        user: { id: user.id },
      },
    });

    if (!isRegisteredParticipant) {
      throw new UnauthorizedException(
        'You are not registered as a participant in this chat room',
      );
    }

    // 이미 참여 중인지 확인
    if (!isRegisteredParticipant.isActive) {
      isRegisteredParticipant.isActive = true;
      await this.participantsRepository.save(isRegisteredParticipant);
    }

    user.isActive = true;
    await this.userRepository.save(user);

    return this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['participants', 'participants.user'],
    });
  }

  async findChatRoomByName(name: string) {
    return this.chatRoomRepository.findOne({
      where: { name },
    });
  }

  async createChatRoom(createChatRoomDto: CreateChatRoomDto) {
    const roomName = createChatRoomDto.name || `채팅방 ${Date.now()}`;

    const existingChatRoom = await this.findChatRoomByName(roomName);
    if (existingChatRoom) {
      throw new Error(`Chat room with name "${roomName}" already exists`);
    }

    const chatRoom = this.chatRoomRepository.create({
      name: roomName,
    });

    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

    // 채팅방 생성자만 참여자로 추가
    const creator = await this.userService.findOneById(
      createChatRoomDto.participants[0],
    );
    if (creator) {
      const participant = this.participantsRepository.create({
        user: creator,
        chatRoom: savedChatRoom,
        isActive: true,
      });
      await this.participantsRepository.save(participant);
    }

    return this.chatRoomRepository.findOne({
      where: { id: savedChatRoom.id },
      relations: ['participants', 'participants.user'],
    });
  }

  async createMessage(createMessageDto: CreateMessageDto, user: User) {
    const { message, chatRoomId } = createMessageDto;
    const chatRoom = await this.findChatRoomById(chatRoomId);
    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${chatRoomId} not found`);
    }

    const newMessage = this.chatRepository.create({
      message,
      chatRoom,
      sender: user,
    });

    const savedMessage = await this.chatRepository.save(newMessage);
    return this.chatRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'chatRoom'],
    });
  }

  async deleteMessage(messageId: number, chatRoomId: number, user: User) {
    const chatRoom = await this.findChatRoomById(chatRoomId);
    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${chatRoomId} not found`);
    }

    const chat = await this.chatRepository.findOne({
      where: {
        id: messageId,
        chatRoom: { id: chatRoomId },
      },
      relations: ['sender'],
    });
    if (!chat) {
      throw new NotFoundException(
        `Message with ID ${messageId} not found in chat room ${chatRoomId}`,
      );
    }
    if (chat.sender.id !== user.id) {
      throw new UnauthorizedException('You are not the sender of this message');
    }
    await this.chatRepository.softDelete(chat.id);
    return {
      messageId,
      chatRoomId,
    };
  }

  async editMessage(editMessageDto: EditMessageDto, user: User) {
    const { chatRoomId, messageId } = editMessageDto;
    const chatRoom = await this.findChatRoomById(chatRoomId);
    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${chatRoomId} not found`);
    }

    const chat = await this.chatRepository.findOne({
      where: {
        id: messageId,
        chatRoom: { id: chatRoomId },
      },
      relations: ['sender'],
    });
    if (!chat) {
      throw new NotFoundException(
        `Message with ID ${messageId} not found in chat room ${chatRoomId}`,
      );
    }

    if (chat.sender.id !== user.id) {
      throw new UnauthorizedException('You are not the sender of this message');
    }

    chat.message = editMessageDto.message;
    await this.chatRepository.save(chat);

    return chat;
  }

  async findChatRoomById(id: number, relations: string[] = []) {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id },
      relations,
    });

    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${id} not found`);
    }

    return chatRoom;
  }

  async isParticipant(
    chatRoomId: number,
    userId: number,
  ): Promise<Participants | null> {
    return this.participantsRepository.findOne({
      where: {
        chatRoom: { id: chatRoomId },
        user: { id: userId },
      },
    });
  }

  async addParticipantsToChatRoom(chatRoomId: number, users: User[]) {
    const chatRoom = await this.findChatRoomById(chatRoomId, ['participants']);
    const addedUsers: User[] = [];
    for (const user of users) {
      // 이미 참여자인지 확인
      const existingParticipant = await this.participantsRepository.findOne({
        where: {
          chatRoom: { id: chatRoomId },
          user: { id: user.id },
        },
      });
      if (!existingParticipant) {
        const participant = this.participantsRepository.create({
          user,
          chatRoom,
          isActive: true,
          joinedAt: new Date(),
        });
        await this.participantsRepository.save(participant);
        addedUsers.push(user);
      }
    }

    return addedUsers;
  }

  async addParticipantsWithValidation(
    chatRoomId: number,
    userIds: number[],
    requesterId: number,
  ) {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('Invalid userIds: must be a non-empty array');
    }

    // 요청한 사용자가 채팅방의 참여자인지 확인
    const isParticipant = await this.isParticipant(chatRoomId, requesterId);
    if (!isParticipant) {
      throw new UnauthorizedException(
        'You are not a participant of this chat room',
      );
    }

    // 추가할 사용자들을 찾아서 참여자로 추가
    const users = await Promise.all(
      userIds.map((userId) => this.userService.findOneById(userId)),
    );

    // null 체크 및 필터링
    const validUsers = users.filter((user): user is User => user !== null);
    const addedUsers = await this.addParticipantsToChatRoom(
      chatRoomId,
      validUsers,
    );

    return {
      chatRoomId,
      addedUsers,
    };
  }

  async leaveChatRoom(payload: { chatRoomId: number }, user: User) {
    const { chatRoomId } = payload;
    const chatRoom = await this.findChatRoomById(chatRoomId, ['participants']);
    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${chatRoomId} not found`);
    }

    const participant = await this.participantsRepository.findOne({
      where: {
        chatRoom: { id: chatRoomId },
        user: { id: user.id },
      },
    });

    if (!participant) {
      throw new UnauthorizedException(
        'You are not a participant of this chat room',
      );
    }
    participant.isActive = false;
    await this.participantsRepository.save(participant);

    return {
      chatRoomId,
      participant,
    };
  }

  async exitChatRoom(payload: { chatRoomId: number }, user: User) {
    const { chatRoomId } = payload;
    const chatRoom = await this.findChatRoomById(chatRoomId, ['participants']);
    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${chatRoomId} not found`);
    }

    const participant = await this.participantsRepository.findOne({
      where: {
        chatRoom: { id: chatRoomId },
        user: { id: user.id },
      },
    });

    if (!participant) {
      throw new UnauthorizedException(
        'You are not a participant of this chat room',
      );
    }
    await this.participantsRepository.softDelete(participant.id);

    return {
      chatRoomId,
      participant,
    };
  }
}
