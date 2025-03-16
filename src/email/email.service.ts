import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // Servidor SMTP do Gmail
    port: process.env.MAIL_PORT, // Porta para TLS (recomendado)
    secure: false, // Usar 'false' para a porta 587 (não SSL)
    auth: {
      user: process.env.MAIL_USER, // Seu e-mail SMTP
      pass: process.env.MAIL_PASS, // Sua senha ou App Password
    },
  });

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: '"POWER GADGET" <rafinha.head@gmail.com>', // Endereço de origem
      to, // Endereço de destino
      subject, // Assunto do email
      text, // Corpo do email em texto puro
      html, // Corpo do email em HTML (opcional)
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar o e-mail:', error);
      throw error; // Lançar erro para ser tratado
    }
  }

  // Outras funções...
}
