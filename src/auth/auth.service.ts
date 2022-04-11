import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  BaseRepository,
  Transactional,
} from 'typeorm-transactional-cls-hooked';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../domain/user.entity';
import { Freelancer } from '../domain/freelancer.entity';
import { CompanyRegisterDto } from './dto/company.register.dto';
import { Company } from '../domain/company.entity';
import { Customer } from '../domain/customer.entity';
import { Certificate } from '../domain/certificate.entity';
import { LoginDto } from './dto/login.dto';
import { CodeInterface } from './interface/jwt.interface';
import { UserService } from '../user/user.service';
import {
  forgotPasswordDto,
  sendEmailForgotPassword,
} from './dto/forgot.password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: BaseRepository<User>,
    @InjectRepository(Freelancer)
    private readonly freelancerRepo: BaseRepository<Freelancer>,
    @InjectRepository(Customer)
    private readonly customerRepo: BaseRepository<Customer>,
    @InjectRepository(Certificate)
    private readonly certificateRepo: BaseRepository<Certificate>,
    @InjectRepository(Company)
    private readonly companyRepo: BaseRepository<Company>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private userService: UserService,
  ) {}
  @Transactional()
  async userRegister(payload: RegisterDto | CompanyRegisterDto) {
    const isExists = await this.userRepo.findOne({
      where: {
        email: payload.email,
      },
    });

    if (isExists) {
      throw new HttpException('User with that email already exists', 400);
    }
    try {
      payload.password = bcrypt.hash(payload.password, 10);
      const token = this.jwtService.sign(payload.email);
      const user = await this.userRepo.save(payload);
      if (payload.role == 'freelancer') {
        await this.freelancerRepo.save({ user: user });
      }
      if (payload.role == 'customer') {
        await this.customerRepo.save({ user: user });
      }

      await this.mailerService.sendMail({
        to: payload.email,
        from: 'admin',
        subject: `Message from ItWall( Activation Account ) ✔`,
        html: `<h2>Your email is't active</h2><br><h3>Please click here for activating your account </h3> <h3><a href="http://localhost:3000/activation-account.html/${token}">Activating account</a></h3>`,
      });

      return {
        message:
          'Registration successfully completed, please check your email to activate your account!!!',
        data: {
          token: token,
        },
      };
    } catch (e) {
      return { message: e.message };
    }
  }
  @Transactional()
  async companyRegister(payload: CompanyRegisterDto, certificate) {
    const isExists = await this.userRepo.findOne({
      where: {
        email: payload.email,
      },
    });

    if (isExists) {
      throw new HttpException('User with that email already exists', 400);
    }

    try {
      payload.password = bcrypt.hash(payload.password, 10);
      const token = this.jwtService.sign(payload.email);
      const toBool = (string) => string === 'true';
      payload.remember = toBool(payload.remember);

      const user = await this.userRepo.save(payload);

      if (payload.role == 'company') {
        const company = await this.companyRepo.save({
          user: user,
          companyName: payload.companyName,
          taxNumber: payload.taxNumber,
        });
        await this.certificateRepo.save({
          image: certificate.path,
          company: company,
        });
      }

      await this.mailerService.sendMail({
        to: payload.email,
        from: 'admin',
        subject: `Message from ItWall( Activation Account ) ✔`,
        html: `<h2>Your email is't active</h2><br><h3>Please click here for activating your account </h3> <h3><a href="http://localhost:3000/activation-account.html/${token}">Activating account</a></h3>`,
      });

      return {
        message:
          'Registration successfully completed, please check your email to activate your account!!!',
        data: {
          token: token,
        },
      };
    } catch (e) {
      return { message: e.message };
    }
  }

  async userLogin(payload: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: payload.email },
    });
    if (!user) {
      throw new HttpException('Invalid email or password', 401);
    }
    const isMatch = await bcrypt.compare(payload.password, user.password);
    if (isMatch) {
      const token = this.jwtService.sign(payload.email);

      if (user.remember !== payload.remember) {
        user.remember = payload.remember;
        await this.userRepo.save(user);
      }
      return {
        message: 'Success',
        data: {
          token: token,
        },
      };
    } else {
      throw new HttpException('Invalid email or password', 401);
    }
  }

  async confirmEmail(data: CodeInterface) {
    try {
      const decoded = this.jwtService.decode(data.token);
      const userEmail = decoded.toString();
      const user = await this.userRepo.findOne({
        where: {
          email: userEmail,
        },
      });

      if (user && user.isActive == false) {
        user.isActive = true;
        await this.userRepo.save(user);
        return {
          message: 'User email is successfully activated.',
        };
      } else {
        return {
          message: 'User email is already activated.',
        };
      }
    } catch (e) {
      return { message: e.message };
    }
  }

  async emailForgotPassword(payload: sendEmailForgotPassword) {
    const user = await this.userRepo.findOne({
      where: {
        email: payload.email,
      },
    });
    if (!user) {
      throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
    }
    try {
      const token = this.jwtService.sign({ email: payload.email });

      await this.mailerService.sendMail({
        to: payload.email,
        from: 'admin',
        subject: `Message from ItWall( Forgot Password ) ✔`,
        html: `<h2>Forgot your password ❓❗</h2><br><h3>Don't worry, you can restore it by clicking on this link </h3> <h3><a href="http://localhost:3000/forgot-password.html/${token}">Restore password</a></h3>`,
      });
      return {
        message: 'Please check your email to restore your password.',
        token: token,
      };
    } catch (e) {
      return { message: e.message };
    }
  }

  async forgotPassword(payload: forgotPasswordDto) {
    // const decoded = jwt.decode(payload.data) as JwtInterface;
    try {
      const decoded = this.jwtService.decode(payload.token);
      const userEmail = decoded.toString();
      const user = await this.userRepo.findOne({
        where: {
          email: userEmail,
        },
      });
      if (payload.newPassword === payload.confirmPassword) {
        user.password = await bcrypt.hash(payload.newPassword, 10);
        await this.userRepo.save(user);
        return {
          message: 'Password successfully changed.',
        };
      } else
        throw new HttpException(
          'New password and confirm password do not match.',
          403,
        );
    } catch (e) {
      return { message: e.message };
    }
  }

  async validateUser(email): Promise<LoginDto> {
    const user = await this.userService.findByPayload(email);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
