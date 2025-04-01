import { User } from 'src/user/entity/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { BaseEntity } from '../common/entity/base.entity';

@Entity()
export class Participants extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.participants)
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.participants)
  user: User;

  @CreateDateColumn()
  joinedAt: Date;
}
