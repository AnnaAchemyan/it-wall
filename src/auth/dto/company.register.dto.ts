import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { Column } from 'typeorm';
import { Role } from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Empty } from '../../validation/spase.validator';

export class CompanyRegisterDto {
  @IsNotEmpty()
  @IsString()
  @Validate(Empty, { message: 'Field is empty' })
  @ApiProperty({ type: String, description: 'Company name' })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @Validate(Empty, { message: 'Field is empty' })
  @ApiProperty({ type: String, description: 'Firstname' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Validate(Empty, { message: 'Field is empty' })
  @ApiProperty({ type: String, description: 'Firstname' })
  lastName: string;

  @IsNotEmpty()
  @Matches(/^[\+]?[(]?[0-9]{3}[)]?[0-9]{3}[-\s\.]?[0-9]{3}$/im, {
    message: 'Not correct Phone number ',
  })
  @ApiProperty({
    type: String,
    description:
      'Phone number has to match a regular expression:  /^[\\+]?[(]?[0-9]{3}[)]?[0-9]{3}[-\\s\\.]?[0-9]{3}$/im',
    example: '+37498888888',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @Validate(Empty, { message: 'Field is empty' })
  @ApiProperty({ type: Number, description: 'Tax number' })
  taxNumber: number;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Validate(Empty, { message: 'Field is empty' })
  @ApiProperty({ type: String, description: 'Email' })
  email: string;

  @IsNotEmpty()
  @Column()
  @MinLength(6)
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
  password: string;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean, description: 'Remember me' })
  remember: boolean;

  @IsNotEmpty()
  @ApiProperty({ enum: Role })
  role: Role;
}
