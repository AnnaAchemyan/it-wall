import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class sendEmailForgotPassword {
  @IsEmail()
  email: string;
}

export class forgotPasswordDto {
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

  @IsString()
  @IsNotEmpty()
  token: string;
}
