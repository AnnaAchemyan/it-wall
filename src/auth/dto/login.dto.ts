import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Empty } from '../../validation/spase.validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Validate(Empty, { message: 'Field is empty' })
  @ApiProperty({ type: String, description: 'Email' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description:
      'Password has to match a regular expression:  /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/',
    example: 'Mary123456',
  })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean, description: 'Remember me' })
  remember: boolean;
}
