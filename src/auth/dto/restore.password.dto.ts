import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RestorePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password should contain minimum eight characters, at least one letter and one number',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
