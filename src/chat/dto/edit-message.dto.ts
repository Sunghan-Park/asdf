import { IsString } from 'class-validator';
import { MaxLength } from 'class-validator';
import { IsNumber } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @IsNumber()
  @IsNotEmpty()
  chatRoomId: number;

  @IsNumber()
  @IsNotEmpty()
  messageId: number;
}
