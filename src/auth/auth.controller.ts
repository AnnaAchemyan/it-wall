import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompanyRegisterDto } from './dto/company.register.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Helper } from '../infrastructure/config/upload.config';
import { CodeInterface } from './interface/jwt.interface';
import { forgotPasswordDto, sendEmailForgotPassword } from "./dto/forgot.password.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async userRegister(@Body() payload: RegisterDto) {
    return this.authService.userRegister(payload);
  }

  @Post('companyRegister')
  @UseInterceptors(
    FileInterceptor('certificate', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
      fileFilter: Helper.fileFilter,
    }),
  )
  async companyRegister(
    @Body() payload: CompanyRegisterDto,
    @UploadedFile() certificate,
  ) {
    return this.authService.companyRegister(payload, certificate);
  }

  @Post('login')
  async userLogin(@Body() payload: LoginDto) {
    return this.authService.userLogin(payload);
  }

  @Post('active')
  async confirmEmail(@Body() token: CodeInterface) {
    return this.authService.confirmEmail(token);
  }

  @Post('emailForgotPassword')
  async emailForgotPassword(@Body() payload: sendEmailForgotPassword) {
    return this.authService.emailForgotPassword(payload);
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() payload: forgotPasswordDto) {
    return this.authService.forgotPassword(payload);
  }
}
