import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { Freelancer } from '../domain/freelancer.entity';
import { Customer } from '../domain/customer.entity';
import { Company } from '../domain/company.entity';
import { Certificate } from '../domain/certificate.entity';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Freelancer,
      Customer,
      Company,
      Certificate,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        algorithm: 'HS256',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
