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
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
dotenv.config();

@Module({
  imports: [
    UserModule,
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
    MailerModule.forRoot({
      transport: {
        host: 'localhost',
        port: 465,
        secure: true,
        service: 'Gmail',
        auth: {
          user: 'msimonyan43@gmail.com',
          pass: 'mary123456@',
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
