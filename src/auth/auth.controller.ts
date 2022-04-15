import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompanyRegisterDto } from './dto/company.register.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
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
import { Request } from 'express';

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
    FilesInterceptor('certificates', 10, {
      storage: diskStorage({
        destination: Helper.destinationPath,
        filename: Helper.customFileName,
      }),
      fileFilter: Helper.fileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({ name: 'certificates' })
  async companyRegister(
    @Body() payload: CompanyRegisterDto,
    @UploadedFiles() certificates: Array<Express.Multer.File>,
  ) {
    return this.authService.companyRegister(payload, certificates);
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
  async googleAuth(@Req() req) {
    return HttpStatus.OK;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req: Request): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
      data: req.user,
    };
  }
}
