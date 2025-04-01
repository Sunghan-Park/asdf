import { Chat } from './chat.entity';
import { Participants } from './participants.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entity/base.entity';

@Entity()
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  name: string;

  @OneToMany(() => Chat, (chat) => chat.chatRoom)
  chats: Chat[];

  @OneToMany(() => Participants, (participant) => participant.chatRoom)
  participants: Participants[];
}
