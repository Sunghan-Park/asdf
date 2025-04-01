import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { Server } from 'socket.io';
import { User } from 'src/user/entity/user.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { EditMessageDto } from './dto/edit-message.dto';

interface AuthenticatedSocket extends Socket {
  user: User;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(client: AuthenticatedSocket) {
    console.log('Client disconnected', client.id);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header provided');
      }

      const user = await this.authService.verifyToken(authHeader);
      client.user = user;
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  @SubscribeMessage('createChatRoom')
  async handleCreateChatRoom(
    @MessageBody() createChatRoomDto: CreateChatRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // 생성자만 참여자로 추가
      createChatRoomDto.participants = [client.user.id];

      const chatRoom = await this.chatService.createChatRoom(createChatRoomDto);
      if (!chatRoom) {
        throw new Error('Failed to create chat room');
      }

      // 생성된 채팅방에 자동으로 참여
      await this.chatService.joinChatRoom(
        { chatRoomId: chatRoom.id },
        client.user,
      );

      client.emit('chatRoomCreated', chatRoom);
    } catch (error: unknown) {
      if (error instanceof Error) {
        client.emit('error', { message: error.message });
      } else {
        client.emit('error', { message: 'An unknown error occurred' });
      }
      throw error;
    }
  }

  @SubscribeMessage('getChatRoom')
  async handleGetChatRoom(
    @MessageBody() payload: { chatRoomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const chatRoom = await this.chatService.findChatRoomById(
        payload.chatRoomId,
      );
      client.emit('chatRoom', chatRoom);
    } catch (error) {
      console.error('Get chat room error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('joinChatRoom')
  async handleJoinChatRoom(
    @MessageBody() payload: { chatRoomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { chatRoomId } = payload;
      const existingParticipant = await this.chatService.isParticipant(
        chatRoomId,
        client.user.id,
      );
      if (existingParticipant) {
        throw new UnauthorizedException(
          'You are already a participant of this chat room',
        );
      }
      await this.chatService.joinChatRoom({ chatRoomId }, client.user);
      await client.join(`chat:${chatRoomId}`);
      client.emit('joinedChatRoom', { chatRoomId });
      this.server.to(`chat:${chatRoomId}`).emit('receiveMessage', {
        message: 'New user joined the chat room',
        sender: client.user.name,
      });
    } catch (error) {
      console.error('Join chat room error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { message: string; chatRoomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { message, chatRoomId } = payload;
      const participant = await this.chatService.isParticipant(
        chatRoomId,
        client.user.id,
      );
      if (!participant || !participant.isActive) {
        throw new UnauthorizedException(
          'You are not a participant of this chat room',
        );
      }
      const savedMessage = await this.chatService.createMessage(
        { message, chatRoomId },
        client.user,
      );

      if (!savedMessage) {
        throw new Error('Failed to save message');
      }

      this.server.to(`chat:${chatRoomId}`).emit('receiveMessage', {
        message: savedMessage.message,
        sender: client.user.name,
      });
    } catch (error) {
      console.error('Send message error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() payload: { chatRoomId: number; messageId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ){
    try {
      const { chatRoomId, messageId } = payload;
      const participant = await this.chatService.isParticipant(
        chatRoomId,
        client.user.id,
      );
      if (!participant || !participant.isActive) {
        throw new UnauthorizedException(
          'You are not a participant of this chat room',
        );
      }
      await this.chatService.deleteMessage(messageId, chatRoomId, client.user);
      this.server.to(`chat:${chatRoomId}`).emit('receiveMessage', {
        message: 'Message deleted',
        sender: client.user.name,
      });
    } catch (error) {
      console.error('Delete message error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error', { message: error.message });
    }
  }
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() payload: EditMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const editedMessage = await this.chatService.editMessage(
        payload,
        client.user,
      );
      this.server.to(`chat:${payload.chatRoomId}`).emit('receiveMessage', {
        message: editedMessage.message,
        sender: client.user.name,
      });
    } catch (error) {
      console.error('Edit message error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error', { message: error.message });
    }
  }


  @SubscribeMessage('addParticipants')
  async handleAddParticipants(
    @MessageBody() data: AddParticipantsDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const result = await this.chatService.addParticipantsWithValidation(
        data.chatRoomId,
        data.userIds,
        client.user.id,
      );

      // 채팅방의 모든 참여자에게 새로운 참여자 추가 알림
      this.server
        .to(`chat:${data.chatRoomId}`)
        .emit('participantsAdded', result);

      return result;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        client.emit('error', { message: error.message });
      } else if (error instanceof NotFoundException) {
        client.emit('error', { message: error.message });
      } else if (error instanceof Error) {
        client.emit('error', { message: error.message });
      } else {
        client.emit('error', { message: 'Failed to add participants' });
      }
      throw error;
    }
  }

  @SubscribeMessage('leaveChatRoom')
  async handleLeaveChatRoom(
    @MessageBody() payload: { chatRoomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { chatRoomId } = payload;
      const participant = await this.chatService.isParticipant(
        chatRoomId,
        client.user.id,
      );

      if (!participant || !participant.isActive) {
        throw new UnauthorizedException(
          'You are not a participant of this chat room',
        );
      }
      await this.chatService.leaveChatRoom({ chatRoomId }, client.user);
      await client.leave(`chat:${chatRoomId}`);
      client.emit('leftChatRoom', { chatRoomId });
      this.server.to(`chat:${chatRoomId}`).emit('receiveMessage', {
        message: 'User left the chat room',
        sender: client.user.name,
      });
    } catch (error) {
      console.error('Leave chat room error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('exitChatRoom')
  async handleExitChatRoom(
    @MessageBody() payload: { chatRoomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { chatRoomId } = payload;
      await this.chatService.exitChatRoom({ chatRoomId }, client.user);
      await client.leave(`chat:${chatRoomId}`);
      client.emit('exitedChatRoom', { chatRoomId });
      this.server.to(`chat:${chatRoomId}`).emit('receiveMessage', {
        message: 'User exited the chat room',
        sender: client.user.name,
      });
    } catch (error) {
      console.error('Exit chat room error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error', { message: error.message });
    }
  }
}
