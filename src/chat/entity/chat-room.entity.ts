import { Chat } from 'src/chat/entity/chat.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.chatRooms)
  users: User[];

  @OneToMany(() => Chat, (chat) => chat.chatRoom)
  messages: Chat[];
}
