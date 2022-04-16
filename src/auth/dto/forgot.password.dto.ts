import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Empty } from '../../validation/spase.validator';

export class sendEmailForgotPassword {
  @IsEmail()
  @Validate(Empty, { message: 'Field is empty' })
  @ApiProperty({ type: String, description: 'Email' })
  email: string;
}

export class forgotPasswordDto {
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password should contain minimum eight characters, at least one letter and one number',
  })
  @ApiProperty({
    type: String,
    description:
      'Password has to match a regular expression:  /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/',
    example: 'Mary123456',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({
    type: String,
    description:
      'Password has to match a regular expression:  /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/',
    example: 'Mary123456',
  })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Token' })
  token: string;
}
