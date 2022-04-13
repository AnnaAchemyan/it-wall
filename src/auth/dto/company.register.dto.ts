import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Column } from 'typeorm';
import { Role } from '../../domain/user.entity';

export class CompanyRegisterDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @Matches(/^[\+]?[(]?[0-9]{3}[)]?[0-9]{3}[-\s\.]?[0-9]{3}$/im, {
    message: 'Not correct Phone number ',
  })
  phoneNumber: string;

  @IsNotEmpty()
  taxNumber: number;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Column()
  @MinLength(6)
  @MaxLength(15)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password should contain minimum eight characters, at least one letter and one number',
  })
  password: string;

  @IsNotEmpty()
  remember: boolean;

  @IsNotEmpty()
  role: Role;
}
