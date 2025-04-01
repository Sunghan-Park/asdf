import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';

export class AddParticipantsDto {
  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  userIds: number[];
}
