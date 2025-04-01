import { IsNotEmpty, IsNumber } from 'class-validator';

export class JoinChatRoomDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;
}
