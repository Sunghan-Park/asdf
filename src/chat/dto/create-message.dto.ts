import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;
}
