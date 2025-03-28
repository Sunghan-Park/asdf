import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entity/base.entity';
import { IsNotEmpty } from 'class-validator';
import { ChatRoom } from './chat-room.entity';
import { User } from 'src/user/entities/user.entity';
@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  roomId: string;

  @Column()
  content: string;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.chats)
  sender: User;
}
