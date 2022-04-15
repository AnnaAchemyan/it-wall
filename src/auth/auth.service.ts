import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  BaseRepository,
  Transactional,
} from 'typeorm-transactional-cls-hooked';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { Freelancer } from '../domain/freelancer.entity';
import { CompanyRegisterDto } from './dto/company.register.dto';
import { Company } from '../domain/company.entity';
import { Customer } from '../domain/customer.entity';
import { Certificate } from '../domain/certificate.entity';
import { LoginDto } from './dto/login.dto';
import { CodeInterface, JwtInterface } from './interface/jwt.interface';
import {
  forgotPasswordDto,
  sendEmailForgotPassword,
} from './dto/forgot.password.dto';
import { RestorePasswordDto } from './dto/restore.password.dto';
import { sendMailUser } from '../sendMail/send.mail';

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
      payload.password = bcrypt.hashSync(payload.password, 10);
      const tokenEmail: JwtInterface = {
        email: payload.email,
      };
      const token = this.jwtService.sign(tokenEmail);
      const user = await this.userRepo.save(payload);

      if (payload.role == 'freelancer') {
        await this.freelancerRepo.save({ user: user });
      }
      if (payload.role == 'customer') {
        await this.customerRepo.save({ user: user });
      }

      await sendMailUser(payload.email, token);

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
  async companyRegister(payload: CompanyRegisterDto, certificates) {
    const isExists = await this.userRepo.findOne({
      where: {
        email: payload.email,
      },
    });

    if (isExists) {
      throw new HttpException('User with that email already exists', 400);
    }

    try {
      payload.password = bcrypt.hashSync(payload.password, 10);
      const tokenEmail: JwtInterface = {
        email: payload.email,
      };
      const token = this.jwtService.sign(tokenEmail);
      const toBool = (string) => string === 'true';
      payload.remember = toBool(payload.remember);

      const user = await this.userRepo.save(payload);

      if (payload.role == 'company') {
        const company = await this.companyRepo.save({
          user: user,
          companyName: payload.companyName,
          taxNumber: payload.taxNumber,
        });
        if (certificates) {
          certificates.map(async (certificate) => {
            await this.certificateRepo.save({
              image: certificate.path,
              company: company,
            });
          });
        }
      }

      await sendMailUser(payload.email, token);

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
    try {
      if (user && !user.isActive) {
        const tokenEmail: JwtInterface = {
          email: payload.email,
        };
        const token = this.jwtService.sign(tokenEmail);
        await sendMailUser(payload.email, token);
        return {
          message: 'Please check your email to activate your account.',
        };
      }
      if (user && user.isActive) {
        const isMatch = await bcrypt.compare(payload.password, user.password);
        if (isMatch) {
          const tokenEmail: JwtInterface = {
            email: payload.email,
          };
          const token = this.jwtService.sign(tokenEmail);
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
    } catch (e) {
      return { message: e.message };
    }
  }

  async confirmEmail(data: CodeInterface) {
    try {
      const decoded = this.jwtService.decode(data.token) as JwtInterface;
      if (!decoded) {
        throw new HttpException('Invalid token', 403);
      }
      const user = await this.userRepo.findOne({
        where: {
          email: decoded.email,
        },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }
      if (user.isActive == false) {
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
      const tokenEmail: JwtInterface = {
        email: payload.email,
      };
      const token = this.jwtService.sign(tokenEmail);

      await sendMailUser(payload.email, token);
      return {
        message: 'Please check your email to restore your password.',
      };
    } catch (e) {
      return { message: e.message };
    }
  }

  async forgotPassword(payload: forgotPasswordDto) {
    try {
      const decoded = this.jwtService.decode(payload.token) as JwtInterface;
      const user = await this.userRepo.findOne({
        where: {
          email: decoded.email,
        },
      });
      if (!user) {
        throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
      } else {
        if (payload.newPassword === payload.confirmPassword) {
          user.password = await bcrypt.hashSync(payload.newPassword, 10);
          if (!user.isActive) {
            user.isActive = true;
          }
          await this.userRepo.save(user);
          return {
            message: 'Your password has changed successfully.',
          };
        } else {
          throw new HttpException(
            'New password and confirm password do not match.',
            403,
          );
        }
      }
    } catch (e) {
      return { message: e.message };
    }
  }

  async restorePassword(currentUser: User, payload: RestorePasswordDto) {
    const user = await this.userRepo.findOne({
      where: {
        email: currentUser.email,
      },
    });
    if (!user) {
      throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
    } else {
      const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
      if (isMatch) {
        if (payload.newPassword === payload.confirmPassword) {
          payload.newPassword = bcrypt.hashSync(payload.newPassword, 10);
          user.password = payload.newPassword;
          const update = await this.userRepo.save(user);
          if (update) {
            return {
              message: 'Your password has changed successfully.',
            };
          }
        } else {
          throw new HttpException(
            'New password and confirm password do not match.',
            403,
          );
        }
      } else {
        throw new HttpException('Old password is incorrect.', 403);
      }
    }
  }

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User Info from Google',
      user: req.user,
    };
  }
}
