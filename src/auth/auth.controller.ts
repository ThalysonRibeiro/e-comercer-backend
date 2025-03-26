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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AccountType } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import {
  CreateUserAdminDTO,
  CreateUserDTO,
} from '../users/dto/create-user.dto';

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
  constructor(private authService: AuthService) {}
  //useradmin
  @Public()
  @Post('register-admin')
  async registerAdmin(@Body() body: CreateUserAdminDTO) {
    return this.authService.registerAdmin(body);
  }

  @Public()
  @Post('login-admin')
  async loginAdmin(@Body() body: { login: string; password: string }) {
    const { login, password } = body;
    return this.authService.loginWithCredentials(login, password);
  }

  @Roles(AccountType.useradmin)
  @Get('admin-only')
  getAdminData() {
    return { message: 'Esta é uma rota protegida apenas para administradores' };
  }

  //userdefault
  @Public()
  @Post('register')
  async register(@Body() body: CreateUserDTO) {
    return this.authService.register(body);
  }

  @Public()
  @Post('google')
  async googleLogin(@Body() body: { token: string }) {
    const googlePayload = await this.authService.validateGoogleToken(
      body.token,
    );
    return this.authService.authenticateWithGoogle(googlePayload);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { login: string; password: string }) {
    const { login, password } = body;
    return this.authService.loginWithCredentials(login, password);
  }

  @Get('profile')
  getProfile(@Req() req) {
    // req.user já contém o usuário autenticado graças ao JwtStrategy
    return req.user;
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
}
