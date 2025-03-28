import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsNotEmpty()
  @IsString()
  password?: string;
}
