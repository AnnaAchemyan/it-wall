import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
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
import {
  forgotPasswordDto,
  sendEmailForgotPassword,
} from './dto/forgot.password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '../domain/user.entity';
import { RestorePasswordDto } from './dto/restore.password.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiImplicitFile } from '@nestjs/swagger/dist/decorators/api-implicit-file.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({
    description:
      'Registration successfully completed, please check your email to activate your account!',
  })
  @ApiBadRequestResponse({ description: 'User with that email already exists' })
  async userRegister(@Body() payload: RegisterDto) {
    return this.authService.userRegister(payload);
  }

  @Post('companyRegister')
  @ApiCreatedResponse({
    description:
      'Registration successfully completed, please check your email to activate your account!',
  })
  @ApiBadRequestResponse({ description: 'User with that email already exists' })
  @UseInterceptors(
    FileInterceptor('certificate', {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
      fileFilter: Helper.fileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({ name: 'certificate', required: true })
  async companyRegister(
    @Body() payload: CompanyRegisterDto,
    @UploadedFile() certificate,
  ) {
    return this.authService.companyRegister(payload, certificate);
  }

  @Post('login')
  @ApiCreatedResponse({ description: 'User Login' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async userLogin(@Body() payload: LoginDto) {
    return this.authService.userLogin(payload);
  }

  @Post('active')
  @ApiBody({
    schema: {
      properties: {
        token: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'User email is successfully activated.' })
  async confirmEmail(@Body() token: CodeInterface) {
    return this.authService.confirmEmail(token);
  }

  @Post('emailForgotPassword')
  @ApiCreatedResponse({
    description: 'Please check your email to restore your password.',
  })
  async emailForgotPassword(@Body() payload: sendEmailForgotPassword) {
    return this.authService.emailForgotPassword(payload);
  }

  @Post('forgotPassword')
  @ApiCreatedResponse({ description: 'Password successfully changed' })
  @ApiForbiddenResponse({
    description: 'New password and confirm password do not match',
  })
  async forgotPassword(@Body() payload: forgotPasswordDto) {
    return this.authService.forgotPassword(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('restorePassword')
  @ApiOkResponse({ description: 'Your password has changed successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  @ApiForbiddenResponse({
    description: 'New password and confirm password do not match.',
  })
  async restorePassword(
    @CurrentUser() currentUser: User,
    @Body() payload: RestorePasswordDto,
  ) {
    return this.authService.restorePassword(currentUser, payload);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
}
