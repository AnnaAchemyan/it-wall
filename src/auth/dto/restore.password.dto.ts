import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class RestorePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  oldPassword: string;

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
  @ApiProperty()
  confirmPassword: string;
}
