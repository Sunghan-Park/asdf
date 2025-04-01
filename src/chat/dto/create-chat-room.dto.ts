import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsNotEmpty()
  participants: number[];
}
