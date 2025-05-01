import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';
import { AccountStatus, AccountType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserAdminDTO,
  CreateUserDTO,
} from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(createUserDTO: CreateUserDTO) {
    const existeEmail = await this.usersService.findByEmail(
      createUserDTO.email,
    );
    const existePhone = await this.usersService.findByEmailOrPhone(
      createUserDTO.phone,
    );
    const existeCpfOrCnpj = await this.usersService.findByCpfOrCnpj(
      createUserDTO.cpf_or_cnpj,
    );

    if (existeEmail || existePhone || existeCpfOrCnpj) {
      throw new HttpException(
        'email, telefone ou cpf já em uso',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Gerar token de verificação de email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    let newUser;
    try {
      newUser = await this.usersService.createUser({
        email: createUserDTO.email.trim(),
        name: createUserDTO.name,
        password: createUserDTO.password, // Idealmente, o password deve ser hashado
        status: AccountStatus.active,
        type: AccountType.userdefault,
        cpf_or_cnpj: createUserDTO.cpf_or_cnpj.trim(),
        genero: createUserDTO.genero.trim(),
        dateOfBirth: createUserDTO.dateOfBirth,
        phone: createUserDTO.phone,
        emailVerificationToken, // Adicionar o token ao criar o usuário
        acceptOffers: createUserDTO.acceptOffers,
        acceptTerms: createUserDTO.acceptTerms,
        documentType: createUserDTO.documentType,
      });

      // Criar URL de confirmação
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3001';
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${emailVerificationToken}`;

      // Enviar um email de confirmação
      try {
        await this.emailService.sendEmail(
          newUser.email,
          'Confirme seu email - POWER GADGET',
          `Olá ${newUser.name}, sua conta foi criada com sucesso! Por favor, confirme seu email clicando no link: ${confirmationUrl}`,
          `
       <!doctype html>
        <html lang="pt-br">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Confirme seu email</title>
            <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f7fa;
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #fff;
                  padding: 20px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .header h1 {
                  font-size: 24px;
                  color: #000;
                }
                .content {
                  font-size: 16px;
                  line-height: 1.5;
                }
                .content p {
                  margin-bottom: 10px;
                }
                .content ul {
                  margin-left: 20px;
                }
                .content ul li {
                  margin-bottom: 5px;
                }
                .button-container {
                  text-align: center;
                  margin: 20px 0;
                }
                .confirm-button {
                  display: inline-block;
                  padding: 12px 30px;
                  font-size: 16px;
                  color: #fff;
                  background-color: #000;
                  text-decoration: none;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
                }
                .confirm-button:hover {
                  background-color: #d03c5e;
                }
                .link {
                  word-wrap: break-word;
                  color: #0062ff;
                  text-decoration: none;
                }
                .link:hover {
                  text-decoration: underline;
                }
                .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #999;
                  margin-top: 20px;
                }
                .footer p {
                  margin: 0;
                }
              </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Confirme seu Email</h1>
              </div>
              <div class="content">
                <p>Olá ${newUser.name},</p>
                <p>
                  Sua conta foi criada com sucesso! Para começar a usar todos os
                  recursos da nossa plataforma, por favor confirme seu email.
                </p>
                <p>Ao confirmar seu email, você terá acesso a:</p>
                <ul>
                  <li>Acesso a conteúdos exclusivos</li>
                  <li>Recursos personalizados</li>
                  <li>Suporte prioritário</li>
                </ul>
                <p>Para confirmar, basta clicar no botão abaixo:</p>
                <div class="button-container">
                  <a href="${confirmationUrl}" class="confirm-button"
                    >Confirmar Meu E-mail</a
                  >
                </div>
                <p>
                  Se o botão não funcionar, copie e cole este link no seu navegador:
                </p>
                <p class="link">${confirmationUrl}</p>
                <p>
                  Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar
                  em contato com nossa equipe de suporte.
                </p>
                <p>
                  Atenciosamente,<br />
                  Equipe POWER GADGET
                </p>
              </div>
              <div class="footer">
                <p>&copy; 2025 POWER GADGET. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>

        `,
        );
      } catch (error) {
        if (newUser) {
          await this.usersService.deleteUser(newUser.id);
        }

        throw new HttpException(
          'Erro ao enviar email de confirmação:',
          HttpStatus.BAD_REQUEST,
        );
        // Opcionalmente, você pode reverter a criação do usuário ou simplesmente continuar
      }

      const jwtPayload = {
        sub: newUser.id,
        email: newUser.email,
        name: newUser.name,
        type: newUser.type,
      };

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          type: newUser.type,
          status: newUser.status,
          isProfileComplete: this.isProfileComplete(newUser),
        },
        accessToken: this.jwtService.sign(jwtPayload),
      };
    } catch (error) {
      // Se o usuário foi criado, mas o envio de e-mail falhou, exclua o usuário
      if (newUser) {
        await this.usersService.deleteUser(newUser.id);
      }
      console.log(error);

      throw new HttpException(
        'Erro durante o registro. Por favor, tente novamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async registerAdmin(createUserAdminDTO: CreateUserAdminDTO) {
    // Recupera a senha do admin do arquivo .env
    const adminPasswordFromEnv =
      this.configService.get<string>('ADMIN_PASSWORD');

    // Verifica se a senha fornecida no DTO é igual à senha do admin do .env
    if (createUserAdminDTO.adminPassword !== adminPasswordFromEnv) {
      throw new HttpException(
        'Senha de administrador incorreta.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Verificar se já existe um email, telefone ou CPF cadastrado
    const existeEmail = await this.usersService.findByEmail(
      createUserAdminDTO.email,
    );
    const existePhone = await this.usersService.findByEmailOrPhone(
      createUserAdminDTO.phone,
    );
    const existeCpfOrCnpj = await this.usersService.findByCpfOrCnpj(
      createUserAdminDTO.cpf_or_cnpj,
    );

    if (existeEmail || existePhone || existeCpfOrCnpj) {
      throw new HttpException(
        'email, telefone ou cpf já existe',
        HttpStatus.BAD_REQUEST,
      );
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    let newUser;
    try {
      // Criação da conta de administrador
      newUser = await this.usersService.createUser({
        email: createUserAdminDTO.email.trim(),
        name: createUserAdminDTO.name,
        password: createUserAdminDTO.password, // Idealmente, o password deve ser hashado
        status: AccountStatus.active,
        type: AccountType.useradmin,
        cpf_or_cnpj: createUserAdminDTO.cpf_or_cnpj.trim(),
        genero: createUserAdminDTO.genero.trim(),
        dateOfBirth: createUserAdminDTO.dateOfBirth,
        phone: createUserAdminDTO.phone,
        emailVerificationToken, // Adicionar o token ao criar o usuário
        acceptOffers: createUserAdminDTO.acceptOffers,
        acceptTerms: createUserAdminDTO.acceptTerms,
        documentType: createUserAdminDTO.documentType,
      });

      // Criar URL de confirmação
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${emailVerificationToken}`;

      // Enviar um email de confirmação
      try {
        await this.emailService.sendEmail(
          newUser.email,
          'Confirme seu email - POWER GADGET',
          `Olá ${newUser.name}, sua conta foi criada com sucesso! Por favor, confirme seu email clicando no link: ${confirmationUrl}`,
          `
       <!doctype html>
        <html lang="pt-br">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Confirme seu email</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f7fa;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 {
                font-size: 24px;
                color: #000;
              }
              .content {
                font-size: 16px;
                line-height: 1.5;
              }
              .content p {
                margin-bottom: 10px;
              }
              .content ul {
                margin-left: 20px;
              }
              .content ul li {
                margin-bottom: 5px;
              }
              .button-container {
                text-align: center;
                margin: 20px 0;
              }
              .confirm-button {
                display: inline-block;
                padding: 12px 30px;
                font-size: 16px;
                color: #fff;
                background-color: #000;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s ease;
              }
              .confirm-button:hover {
                background-color: #d03c5e;
              }
              .link {
                word-wrap: break-word;
                color: #0062ff;
                text-decoration: none;
              }
              .link:hover {
                text-decoration: underline;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #999;
                margin-top: 20px;
              }
              .footer p {
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Confirme seu Email</h1>
              </div>
              <div class="content">
                <p>Olá ${newUser.name},</p>
                <p>
                  Sua conta foi criada com sucesso! Para começar a usar todos os
                  recursos da nossa plataforma, por favor confirme seu email.
                </p>
                <p>Ao confirmar seu email, você terá acesso a:</p>
                <ul>
                  <li>Acesso a conteúdos exclusivos</li>
                  <li>Recursos personalizados</li>
                  <li>Suporte prioritário</li>
                </ul>
                <p>Para confirmar, basta clicar no botão abaixo:</p>
                <div class="button-container">
                  <a href="${confirmationUrl}" class="confirm-button"
                    >Confirmar Meu E-mail</a
                  >
                </div>
                <p>
                  Se o botão não funcionar, copie e cole este link no seu navegador:
                </p>
                <p class="link">${confirmationUrl}</p>
                <p>
                  Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar
                  em contato com nossa equipe de suporte.
                </p>
                <p>
                  Atenciosamente,<br />
                  Equipe POWER GADGET
                </p>
              </div>
              <div class="footer">
                <p>&copy; 2025 POWER GADGET. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>

        `,
        );
      } catch (error) {
        if (newUser) {
          await this.usersService.deleteUser(newUser.id);
        }
        throw new HttpException(
          'Erro ao enviar email de confirmação:',
          HttpStatus.BAD_REQUEST,
        );
        // Opcionalmente, você pode reverter a criação do usuário ou simplesmente continuar
      }

      const jwtPayload = {
        sub: newUser.id,
        email: newUser.email,
        name: newUser.name,
        type: newUser.type,
      };

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          type: newUser.type,
          status: newUser.status,
          isProfileComplete: this.isProfileComplete(newUser),
        },
        accessToken: this.jwtService.sign(jwtPayload),
      };
    } catch (error) {
      if (newUser) {
        await this.usersService.deleteUser(newUser.id);
      }
      throw new HttpException(
        'Erro ao enviar email de confirmação:',
        HttpStatus.BAD_REQUEST,
      );
      // Opcionalmente, você pode reverter a criação do usuário ou simplesmente continuar
    }
  }

  async validateGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token inválido');
      }

      return payload;
    } catch (error) {
      console.error('Erro ao verificar token do Google:', error);
      throw new UnauthorizedException('Falha na verificação do token Google');
    }
  }

  async authenticateWithGoogle(googlePayload: any) {
    const { sub, email, name, picture } = googlePayload;

    // Verificar se usuário existe com este googleId
    let user = await this.usersService.findByGoogleId(sub);

    if (!user) {
      // Verificar se existe usuário com mesmo email
      const existingUser = await this.usersService.findByEmail(email);

      if (existingUser) {
        // Atualizar usuário existente com informações do Google
        user = await this.usersService.updateUser(existingUser.id, {
          googleId: sub,
          name: name || existingUser.name,
          avatar: picture || existingUser.avatar,
        });
      } else {
        // Para novos usuários via Google, precisamos de informações adicionais
        // que seriam coletadas em um fluxo separado após a autenticação inicial

        // Criar novo usuário com valores padrão iniciais
        user = await this.usersService.createUser({
          email,
          name,
          googleId: sub,
          avatar: picture,
          status: AccountStatus.active,
          type: AccountType.userdefault,
          cpf_or_cnpj: '',
          genero: '',
          phone: '',
        });
      }
    }

    // Verificar se o usuário está ativo
    if (user.status === AccountStatus.inactive) {
      throw new UnauthorizedException(
        'Conta inativa. Entre em contato com o administrador.',
      );
    }

    // Gerar JWT token com informações do usuário
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        type: user.type,
        status: user.status,
        isProfileComplete: this.isProfileComplete(user),
        cpf_or_cnpj: user.cpf_or_cnpj,
        genero: user.genero,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
      accessToken: this.jwtService.sign(jwtPayload),
    };
  }

  async loginWithCredentials(login: string, password: string) {
    const user = await this.usersService.findByEmailOrPhone(login);

    if (!user) {
      throw new HttpException(
        'E-mail ou senha incorretos.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new HttpException(
        'E-mail ou senha incorretos.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Gerar JWT token
    const payload = { sub: user.id, email: user.email, phone: user.phone };
    const {
      id,
      status,
      type,
      name,
      cpf_or_cnpj,
      genero,
      dateOfBirth,
      email,
      phone,
      resetPasswordToken,
      resetPasswordExpires,
      emailVerified,
      emailVerificationToken,
      googleId,
      avatar,
      createdAt,
      updatedAt,
    } = user;
    return {
      accessToken: this.jwtService.sign(payload),
      id,
      status,
      type,
      name,
      cpf_or_cnpj,
      genero,
      dateOfBirth,
      email,
      phone,
      resetPasswordToken,
      resetPasswordExpires,
      emailVerified,
      emailVerificationToken,
      googleId,
      avatar,
      createdAt,
      updatedAt,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (!user.password) {
      throw new HttpException(
        'Usuário não possue senha configurada',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Senha atual incorreta', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.updateUser(userId, {
      password: hashedPassword,
    });

    try {
      await this.emailService.sendEmail(
        user.email,
        'Confirmação de alteração de senha',
        `Olá ${user.name || 'Usuário'}, sua senha foi alterada com sucesso.`,
        `<h1>Olá ${user.name || 'Usuário'},</h1><p>Sua senha foi alterada com sucesso. Se você não solicitou esta alteração, entre em contato conosco imediatamente.</p>`,
      );
    } catch (error) {
      throw new HttpException(
        'Erro ao enviar email de confirmação de alteração de senha:',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Senha alterada com sucesso.',
    };
  }

  async generatePasswordResetToken(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        message: 'Se o email existir, um link de recuperação será enviado.',
      };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '1h' },
    );

    await this.usersService.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hora
    } as any);

    const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendEmail(
        user.email,
        'Recuperação de Senha',
        `Olá ${user.name || 'Usuário'}, para redefinir sua senha, acesse o link: ${resetLink}`,
        `<h1>Olá ${user.name || 'Usuário'},</h1>
         <p>Recebemos uma solicitação para redefinir sua senha.</p>
         <p>Clique no link abaixo para criar uma nova senha:</p>
         <a href="${resetLink}">Redefinir Senha</a>
         <p>Este link é válido por 1 hora.</p>
         <p>Se você não solicitou esta alteração, ignore este email.</p>`,
      );
    } catch (error) {
      throw new HttpException(
        'Erro ao enviar email de recuperação de senha:',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Se o email existir, um link de recuperação será enviado.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verificar token
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user || user.resetPasswordToken !== token) {
        throw new HttpException('Token inválido.', HttpStatus.BAD_REQUEST);
      }

      if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
        throw new HttpException('Token expirado.', HttpStatus.BAD_REQUEST);
      }

      // Criptografar a nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar a senha do usuário e limpar o token de redefinição
      await this.usersService.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      // Enviar email de confirmação
      try {
        await this.emailService.sendEmail(
          user.email,
          'Senha redefinida com sucesso',
          `Olá ${user.name || 'Usuário'}, sua senha foi redefinida com sucesso.`,
          `<h1>Olá ${user.name || 'Usuário'},</h1><p>Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.</p>`,
        );
      } catch (error) {
        throw new HttpException(
          'Erro ao enviar email de confirmação de redefinição de senha:',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { message: 'Senha redefinida com sucesso.' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao redefinir a senha.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Verificar se o perfil está completo

  private isProfileComplete(user: any): boolean {
    return !!(
      user.cpf &&
      user.genero &&
      user.dateOfBirth &&
      user.phone &&
      user.name
    );
  }

  validateJwtPayload(payload: any) {
    return this.usersService.findByEmail(payload.email);
  }
}
