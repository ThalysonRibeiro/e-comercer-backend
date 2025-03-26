// email-verification.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service'; // Ajuste o caminho conforme necessário
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async sendVerificationEmail(userId: string): Promise<{ success: boolean }> {
    // Buscar o usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Gerar token
    const token = crypto.randomBytes(32).toString('hex');

    // Salvar token no banco de dados
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: token },
    });

    // Criar a URL de confirmação
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const confirmationUrl = `${frontendUrl}/confirm-email?token=${token}`;

    // Texto do email em formato plaintext
    const textEmail = `
      Olá ${user.name || 'Usuário'},
      
      Obrigado por se cadastrar em nossa plataforma!
      
      Por favor, confirme seu email clicando no link abaixo:
      ${confirmationUrl}
      
      Se você não solicitou esta confirmação, ignore este email.
      
      Atenciosamente,
      Equipe POWER GADGET
    `;

    // Versão HTML do email
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Confirmação de Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; 
                    text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Olá, ${user.name || 'Usuário'}!</h1>
          <p>Obrigado por se cadastrar em nossa plataforma. Por favor, confirme seu email clicando no botão abaixo:</p>
          <p><a href="${confirmationUrl}" class="button">Confirmar meu email</a></p>
          <p>Ou copie e cole o link abaixo no seu navegador:</p>
          <p>${confirmationUrl}</p>
          <p>Se você não solicitou esta confirmação, ignore este email.</p>
          <p>Atenciosamente,<br>Equipe POWER GADGET</p>
        </div>
      </body>
      </html>
    `;

    // Enviar o email usando seu serviço existente
    await this.emailService.sendEmail(
      user.email,
      'Confirmação de Email - POWER GADGET',
      textEmail,
      htmlEmail,
    );

    return { success: true };
  }

  async verifyEmail(token: string): Promise<{ success: boolean; user?: any }> {
    // Buscar usuário pelo token
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new Error('Token inválido ou expirado');
    }

    // Atualizar o usuário como verificado e limpar o token
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null, // limpar o token após uso
      },
    });

    return { success: true, user: updatedUser };
  }

  async confirmEmail(token: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new HttpException(
        'Token inválido ou expirado.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verifique se o token já foi utilizado ou se o email já foi confirmado
    if (user.emailVerified) {
      throw new HttpException(
        'Este email já foi confirmado.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Atualize o usuário para marcar o email como confirmado
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null, // Limpa o token para que não possa ser reutilizado
      },
    });

    return { success: true };
  }
}
