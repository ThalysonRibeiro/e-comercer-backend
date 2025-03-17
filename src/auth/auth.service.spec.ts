import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


jest.mock('bcrypt'); // Mock do módulo bcrypt

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let emailService: EmailService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByEmailOrPhone: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    findByGoogleId: jest.fn(),
    findByCPF: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw an error if email, phone or CPF already exists', async () => {
      mockUsersService.findByEmail.mockReturnValueOnce(Promise.resolve(true));

      await expect(authService.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        phone: '123456789',
        cpf: '12345678901',
        genero: 'M',
        dateOfBirth: '1990-01-01',
        status: 'ativo',
        type: 'userdefault',
      })).rejects.toThrow(new HttpException('email, telefone ou cpf já existe', HttpStatus.BAD_REQUEST));
    });

    it('should create a new user and send confirmation email', async () => {
      mockUsersService.findByEmail.mockReturnValueOnce(Promise.resolve(false));
      mockUsersService.findByEmailOrPhone.mockReturnValueOnce(Promise.resolve(false));
      mockUsersService.findByCPF.mockReturnValueOnce(Promise.resolve(false));
      mockUsersService.createUser.mockReturnValueOnce(Promise.resolve({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        status: 'ativo', // Certifique-se de que o status é retornado
        type: 'userdefault', // Certifique-se de que o type é retornado
      }));
      mockConfigService.get.mockReturnValueOnce('http://localhost:3001');
      mockJwtService.sign.mockReturnValue('mocked_jwt_token');

      await expect(authService.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        phone: '123456789',
        cpf: '12345678901',
        genero: 'M',
        dateOfBirth: '1990-01-01',
        status: 'ativo',
        type: 'userdefault',
      })).resolves.toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          avatar: undefined,
          type: 'userdefault',
          status: 'ativo',
          isProfileComplete: expect.any(Boolean),
        },
        accessToken: 'mocked_jwt_token',
      });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('registerAdmin', () => {
    it('should throw an error if admin password is incorrect', async () => {
      mockConfigService.get.mockReturnValueOnce('admin_password');

      await expect(authService.registerAdmin({
        adminPassword: 'wrong_password',
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin_password',
        phone: '123456789',
        cpf: '12345678901',
        genero: 'M',
        dateOfBirth: '1990-01-01',
        status: 'ativo',
        type: 'useradmin',
      })).rejects.toThrow(new HttpException('Senha de administrador incorreta.', HttpStatus.FORBIDDEN));
    });

    it('should create a new admin user and send confirmation email', async () => {
      mockConfigService.get.mockReturnValueOnce('admin_password');
      mockUsersService.findByEmail.mockReturnValueOnce(Promise.resolve(false));
      mockUsersService.findByEmailOrPhone.mockReturnValueOnce(Promise.resolve(false));
      mockUsersService.findByCPF.mockReturnValueOnce(Promise.resolve(false));
      mockUsersService.createUser.mockReturnValueOnce(Promise.resolve({
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        status: 'ativo',
        type: 'useradmin',
      }));
      mockConfigService.get.mockReturnValueOnce('http://localhost:3001');
      mockJwtService.sign.mockReturnValue('mocked_jwt_token');

      await expect(authService.registerAdmin({
        adminPassword: 'admin_password',
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin_password',
        phone: '123456789',
        cpf: '12345678901',
        genero: 'M',
        dateOfBirth: '1990-01-01',
        status: 'ativo',
        type: 'useradmin',
      })).resolves.toEqual({
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          avatar: undefined,
          type: 'useradmin',
          status: 'ativo',
          isProfileComplete: expect.any(Boolean),
        },
        accessToken: 'mocked_jwt_token',
      });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('loginWithCredentials', () => {
    it('should throw an error if user does not exist', async () => {
      mockUsersService.findByEmailOrPhone.mockReturnValueOnce(Promise.resolve(null));

      await expect(authService.loginWithCredentials('test@example.com', 'password'))
        .rejects.toThrow(new HttpException('E-mail ou senha incorretos.', HttpStatus.BAD_REQUEST));
    });

    it('should throw an error if password is incorrect', async () => {
      mockUsersService.findByEmailOrPhone.mockReturnValueOnce(Promise.resolve({ id: '1', password: 'hashed_password' }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.loginWithCredentials('test@example.com', 'wrong_password'))
        .rejects.toThrow(new HttpException('E-mail ou senha incorretos.', HttpStatus.BAD_REQUEST));
    });

    it('should return access token and user if credentials are correct', async () => {
      mockUsersService.findByEmailOrPhone.mockReturnValueOnce(Promise.resolve({ id: '1', password: 'hashed_password' }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mocked_access_token');

      const result = await authService.loginWithCredentials('test@example.com', 'password');
      expect(result).toEqual({
        accessToken: 'mocked_access_token',
        user: { id: '1', password: 'hashed_password' },
      });
    });
  });

  describe('changePassword', () => {
    it('should throw an error if user does not exist', async () => {
      mockUsersService.findById.mockReturnValueOnce(Promise.resolve(null));

      await expect(authService.changePassword('1', 'currentPassword', 'newPassword'))
        .rejects.toThrow(new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND));
    });

    it('should throw an error if current password is incorrect', async () => {
      mockUsersService.findById.mockReturnValueOnce(Promise.resolve({ id: '1', password: 'hashed_password' }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.changePassword('1', 'wrongPassword', 'newPassword'))
        .rejects.toThrow(new HttpException('Senha atual incorreta', HttpStatus.BAD_REQUEST));
    });

    it('should change the password successfully', async () => {
      mockUsersService.findById.mockReturnValueOnce(Promise.resolve({ id: '1', password: 'hashed_password' }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockUsersService.updateUser.mockReturnValueOnce(Promise.resolve());

      await expect(authService.changePassword('1', 'currentPassword', 'newPassword'))
        .resolves.toEqual({ message: 'Senha alterada com sucesso.' });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should send recovery email if user exists', async () => {
      mockUsersService.findByEmail.mockReturnValueOnce(Promise.resolve({ id: '1', email: 'test@example.com', name: 'Test User' }));
      mockJwtService.sign.mockReturnValue('mocked_reset_token');
      mockUsersService.updateUser.mockReturnValueOnce(Promise.resolve());
      mockConfigService.get.mockReturnValueOnce('http://localhost:3001');

      await expect(authService.generatePasswordResetToken('test@example.com'))
        .resolves.toEqual({ message: 'Se o email existir, um link de recuperação será enviado.' });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should not send email if user does not exist', async () => {
      mockUsersService.findByEmail.mockReturnValueOnce(Promise.resolve(null));

      await expect(authService.generatePasswordResetToken('nonexistent@example.com'))
        .resolves.toEqual({ message: 'Se o email existir, um link de recuperação será enviado.' });
    });
  });

  describe('resetPassword', () => {
    it('should throw an error if token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => { throw new Error(); });

      await expect(authService.resetPassword('invalid_token', 'newPassword'))
        .rejects.toThrow(new HttpException('Erro ao redefinir a senha.', HttpStatus.BAD_REQUEST));
    });

    it('should throw an error if user does not exist', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: '1' });
      mockUsersService.findById.mockReturnValueOnce(Promise.resolve(null));

      await expect(authService.resetPassword('valid_token', 'newPassword'))
        .rejects.toThrow(new HttpException('Token inválido.', HttpStatus.BAD_REQUEST));
    });

    it('should reset the password successfully', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: '1' });
      mockUsersService.findById.mockReturnValueOnce(Promise.resolve({ id: '1', resetPasswordToken: 'valid_token', resetPasswordExpires: new Date(Date.now() + 3600000) }));
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockUsersService.updateUser.mockReturnValueOnce(Promise.resolve());

      await expect(authService.resetPassword('valid_token', 'newPassword'))
        .resolves.toEqual({ message: 'Senha redefinida com sucesso.' });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('validateGoogleToken', () => {
    it('should throw an error if token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => { throw new Error(); });

      await expect(authService.validateGoogleToken('invalid_token'))
        .rejects.toThrow(new UnauthorizedException('Falha na verificação do token Google'));
    });
  });

  describe('authenticateWithGoogle', () => {
    it('should create a new user if not exist', async () => {
      const googlePayload = { sub: 'google_id', email: 'test@example.com', name: 'Test User', picture: 'avatar_url' };
      mockUsersService.findByGoogleId.mockReturnValueOnce(Promise.resolve(null));
      mockUsersService.findByEmail.mockReturnValueOnce(Promise.resolve(null));
      mockUsersService.createUser.mockReturnValueOnce(Promise.resolve({ id: '1', ...googlePayload }));

      const result = await authService.authenticateWithGoogle(googlePayload);
      expect(result.user.email).toEqual('test@example.com');
      expect(result.accessToken).toBeDefined();
    });

    it('should update existing user if email exists', async () => {
      const googlePayload = { sub: 'google_id', email: 'test@example.com', name: 'Test User', picture: 'avatar_url' };
      mockUsersService.findByGoogleId.mockReturnValueOnce(Promise.resolve(null));
      mockUsersService.findByEmail.mockReturnValueOnce(Promise.resolve({ id: '1' }));
      mockUsersService.updateUser.mockReturnValueOnce(Promise.resolve({ id: '1', ...googlePayload }));

      const result = await authService.authenticateWithGoogle(googlePayload);
      expect(result.user.email).toEqual('test@example.com');
      expect(result.accessToken).toBeDefined();
    });
  });

  // Adicione mais testes para métodos adicionais conforme necessário.
});