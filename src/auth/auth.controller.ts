import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Patch,
  HttpException,
  HttpStatus,
  NotFoundException,
  Query,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AccountType } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import {
  CreateUserAdminDTO,
  CreateUserDTO,
} from '../users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard } from './jwt-auth.guard';

// DTOs

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ForgotPasswordDto {
  email: string;
}

export class ResetPasswordDto {
  token: string;
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }
  //useradmin
  @Public()
  @Post('register-admin')
  @Throttle({
    default: {
      limit: parseInt(process.env.THROTTLE_REGISTER_RATE_LIMIT || '3'),
      ttl: parseInt(process.env.THROTTLE_RATE_LIMIT_TTL || '60000'),
    },
  })
  async registerAdmin(@Body() body: CreateUserAdminDTO) {
    return this.authService.registerAdmin(body);
  }

  @Public()
  @Post('login-admin')
  @Throttle({
    default: {
      limit: parseInt(process.env.THROTTLE_LOGIN_RATE_LIMIT || '5'),
      ttl: parseInt(process.env.THROTTLE_RATE_LIMIT_TTL || '60000'),
    },
  })
  async loginAdmin(@Body() body: { login: string; password: string }) {
    const { login, password } = body;
    return this.authService.loginWithCredentials(login, password);
  }

  @Roles(AccountType.useradmin)
  @Get('admin/admin-only')
  getAdminData() {
    return { message: 'Esta é uma rota protegida apenas para administradores' };
  }

  //userdefault
  @Public()
  @Post('register')
  @Throttle({
    default: {
      limit: parseInt(process.env.THROTTLE_REGISTER_RATE_LIMIT || '3'),
      ttl: parseInt(process.env.THROTTLE_RATE_LIMIT_TTL || '60000'),
    },
  })
  async register(@Body() body: CreateUserDTO) {
    return this.authService.register(body);
  }

  @Public()
  @Post('google')
  @Throttle({
    default: {
      limit: parseInt(process.env.THROTTLE_LOGIN_RATE_LIMIT || '5'),
      ttl: parseInt(process.env.THROTTLE_RATE_LIMIT_TTL || '60000'),
    },
  })
  async googleLogin(@Body() body: { token: string }) {
    const googlePayload = await this.authService.validateGoogleToken(
      body.token,
    );
    return this.authService.authenticateWithGoogle(googlePayload);
  }

  @Public()
  @Post('login')
  @Throttle({
    default: {
      limit: parseInt(process.env.THROTTLE_LOGIN_RATE_LIMIT || '5'),
      ttl: parseInt(process.env.THROTTLE_RATE_LIMIT_TTL || '60000'),
    },
  })
  async login(@Body() body: { login: string; password: string }) {
    const { login, password } = body;
    return this.authService.loginWithCredentials(login, password);
  }

  @Public()
  @Get('profile/:id')
  getProfile(@Param('id') id: string) {
    // req.user já contém o usuário autenticado graças ao JwtStrategy
    return this.usersService.userById(id);
  }

  // Alterar senha (requer autenticação)
  @Patch('password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  // Esqueceu a senha (enviar link de redefinição)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.generatePasswordResetToken(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async logout(@Req() req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await this.authService.logout(token);
    }
  }
}
