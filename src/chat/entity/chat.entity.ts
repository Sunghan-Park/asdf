import { User } from 'src/user/entity/user.entity';
import { ChatRoom } from './chat-room.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from '../common/entity/base.entity';

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @ManyToOne(() => User, (user) => user.chats)
  sender: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chats)
  chatRoom: ChatRoom;

  @DeleteDateColumn()
  deletedAt: Date;
}
