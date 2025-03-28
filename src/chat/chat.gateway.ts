import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { ChatRoomService } from './chat-room.service';
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly chatRoomService: ChatRoomService,
  ) {}

  private activeUsers = new Map<number, string>();

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    for (const [userId, socketId] of this.activeUsers.entries()) {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { userId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.userService.findOneById(data.userId);
    const receiver = await this.userService.findOneById(data.receiverId);
    if (user && receiver) {
      const chatRoom = await this.chatRoomService.createChatRoom([
        user,
        receiver,
      ]);
      this.server.to(client.id).emit('chatRoomCreated', chatRoom);
    } else {
      console.log(`User ${data.userId} already joined`);
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    data: {
      userId: number;
      receiverId: number;
      content: string;
    },
  ) {
    if (
      this.activeUsers.has(data.userId) ||
      this.activeUsers.has(data.receiverId)
    ) {
      console.log('User is online');
    } else {
      console.log('User is offline');
    }
    const receiverSocketId = this.activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('message', {
        senderId: data.userId,
        content: data.content,
      });
    }
    console.log(
      `received message from ${data.userId}, content: ${data.content}`,
    );
  }

  @SubscribeMessage('receivedMessage')
  handleReceivedMessage(
    @MessageBody()
    data: {
      userId: number;
      receiverId: number;
      content: string;
    },
  ) {
    if (this.activeUsers.has(data.userId)) {
      console.log(
        `received message from ${data.userId}. content: ${data.content}`,
      );
    }
  }
}
