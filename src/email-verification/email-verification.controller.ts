import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private emailVerificationService: EmailVerificationService) { }

  @Post('send')
  @UseGuards(JwtAuthGuard) // Se quiser proteger a rota (opcional)
  async sendVerification(@Body() body: { userId: string }) {
    return this.emailVerificationService.sendVerificationEmail(body.userId);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token não fornecido', HttpStatus.BAD_REQUEST);
    }

    try {
      // Usa o método existente do serviço
      const result = await this.emailVerificationService.verifyEmail(token);
      return { success: true, message: 'Email verificado com sucesso!' };
    } catch (error) {
      if (error.message === 'Token inválido ou expirado') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Erro ao verificar email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('confirm-email')
  async confirmEmail(@Body() body: { token: string }) {
    return this.emailVerificationService.confirmEmail(body.token);
  }
}
