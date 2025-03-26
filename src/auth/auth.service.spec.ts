import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { AccountStatus, AccountType } from '@prisma/client';
import {
  CreateUserAdminDTO,
  CreateUserDTO,
} from '../users/dto/create-user.dto';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('randomToken')),
}));
jest.mock('google-auth-library');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByEmailOrPhone: jest.fn(),
    findByCPF: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    findByGoogleId: jest.fn(),
    updateUser: jest.fn(),
    findById: jest.fn(),
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
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDTO: CreateUserDTO = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      cpf: '12345678900',
      genero: 'masculino',
      dateOfBirth: '1990-01-01',
      phone: '1234567890',
      status: 'ativo',
      type: 'userdefault',
    };

    it('should successfully register a new user', async () => {
      // Mock existing checks
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
      mockUsersService.findByCPF.mockResolvedValue(null);

      // Mock user creation
      const mockNewUser = {
        id: 'user-id',
        ...createUserDTO,
        status: AccountStatus.ativo,
        type: AccountType.userdefault,
      };
      mockUsersService.createUser.mockResolvedValue(mockNewUser);

      // Mock config and email services
      mockConfigService.get.mockReturnValue('http://frontend.com');
      mockEmailService.sendEmail.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Perform registration
      const result = await authService.register(createUserDTO);

      // Assertions
      expect(result.user.email).toBe(createUserDTO.email);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    it('should throw error if email, phone, or CPF already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({});

      await expect(authService.register(createUserDTO)).rejects.toThrow(
        HttpException,
      );
    });

    it('should delete user and throw error if email sending fails', async () => {
      // Mock existing checks
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
      mockUsersService.findByCPF.mockResolvedValue(null);

      // Mock user creation
      const mockNewUser = {
        id: 'user-id',
        ...createUserDTO,
        status: AccountStatus.ativo,
        type: AccountType.userdefault,
      };
      mockUsersService.createUser.mockResolvedValue(mockNewUser);

      // Mock email service to throw an error
      mockEmailService.sendEmail.mockRejectedValue(
        new Error('Email sending failed'),
      );

      await expect(authService.register(createUserDTO)).rejects.toThrow(
        HttpException,
      );
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(mockNewUser.id);
    });
  });

  describe('registerAdmin', () => {
    const createAdminDTO: CreateUserAdminDTO = {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'adminpassword',
      cpf: '12345678900',
      genero: 'masculino',
      dateOfBirth: '1990-01-01',
      phone: '1234567890',
      adminPassword: 'correct-admin-password', // senha correta no DTO
      status: 'ativo',
      type: 'useradmin',
    };

    it('should successfully register an admin user', async () => {
      // Mock admin password from environment
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'ADMIN_PASSWORD') return 'correct-admin-password'; // Certifique-se de que o mock retorna a senha correta do env
        if (key === 'FRONTEND_URL') return 'http://frontend.com';
      });

      // Mock existing checks
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
      mockUsersService.findByCPF.mockResolvedValue(null);

      // Mock user creation
      const mockNewUser = {
        id: 'admin-id',
        ...createAdminDTO,
        status: AccountStatus.ativo,
        type: AccountType.useradmin,
      };
      mockUsersService.createUser.mockResolvedValue(mockNewUser);

      // Mock email and JWT services
      mockEmailService.sendEmail.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Perform registration
      const result = await authService.registerAdmin(createAdminDTO);

      // Assertions
      expect(result.user.email).toBe(createAdminDTO.email);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    it('should throw error for incorrect admin password', async () => {
      // Mock incorrect admin password
      const incorrectAdminDTO = {
        ...createAdminDTO,
        adminPassword: 'wrong-admin-password', // senha incorreta
      };

      // Mock admin password from env to be correct
      mockConfigService.get.mockReturnValue('correct-admin-password');

      // Expect error to be thrown due to incorrect admin password
      await expect(
        authService.registerAdmin(incorrectAdminDTO),
      ).rejects.toThrow(
        new HttpException(
          'Senha de administrador incorreta.',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
  });

  describe('validateGoogleToken', () => {
    it('should validate a google token successfully', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          sub: 'google-id',
          email: 'test@example.com',
          name: 'Test User',
        }),
      };

      (OAuth2Client.prototype.verifyIdToken as jest.Mock).mockResolvedValue(
        mockTicket,
      );
      mockConfigService.get.mockReturnValue('client-id');

      const payload = await authService.validateGoogleToken('test-token');

      expect(payload.email).toBe('test@example.com');
    });

    it('should throw unauthorized exception for invalid token', async () => {
      (OAuth2Client.prototype.verifyIdToken as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        authService.validateGoogleToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('authenticateWithGoogle', () => {
    const googlePayload = {
      sub: 'google-id',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'http://example.com/avatar.jpg',
    };

    it('should authenticate existing user with google id', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        status: AccountStatus.ativo,
        type: AccountType.userdefault,
      };

      mockUsersService.findByGoogleId.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.authenticateWithGoogle(googlePayload);

      expect(result.user.email).toBe(existingUser.email);
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should create new user if google id not found', async () => {
      mockUsersService.findByGoogleId.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);

      const newUser = {
        id: 'new-user-id',
        ...googlePayload,
        status: AccountStatus.ativo,
        type: AccountType.userdefault,
      };
      mockUsersService.createUser.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.authenticateWithGoogle(googlePayload);

      expect(result.user.email).toBe(googlePayload.email);
      expect(mockUsersService.createUser).toHaveBeenCalled();
    });
  });

  describe('loginWithCredentials', () => {
    it('should login successfully with valid credentials', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        phone: '1234567890',
        password: await bcrypt.hash('password123', 10),
      };

      mockUsersService.findByEmailOrPhone.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.loginWithCredentials(
        'test@example.com',
        'password123',
      );

      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw error for non-existent user', async () => {
      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);

      await expect(
        authService.loginWithCredentials('test@example.com', 'password123'),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error for invalid password', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        phone: '1234567890',
        password: await bcrypt.hash('password123', 10),
      };

      mockUsersService.findByEmailOrPhone.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginWithCredentials('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('changePassword', () => {
    const userId = 'user-id';
    const currentPassword = 'oldpassword';
    const newPassword = 'newpassword';

    // it('should change password successfully', async () => {
    //   const user = {
    //     id: userId,
    //     email: 'test@example.com',
    //     name: 'Test User',
    //     password: await bcrypt.hash(currentPassword, 10), // Senha configurada corretamente
    //   };

    //   // Mock para o serviço de busca do usuário
    //   mockUsersService.findById.mockResolvedValueOnce(user);

    //   // Mock para a comparação de senha
    //   (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    //   // Mock para o hash da nova senha
    //   (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');

    //   // Mock para o serviço de envio de email
    //   mockEmailService.sendEmail.mockResolvedValue(true);

    //   // Chamada para a função changePassword
    //   const result = await authService.changePassword(userId, currentPassword, newPassword);

    //   // Asserções
    //   expect(result.message).toBe('Senha alterada com sucesso.');
    //   expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, {
    //     password: 'hashed-new-password',
    //   });
    // });

    it('should throw error for non-existent user', async () => {
      // Mock para quando o usuário não existe
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error for incorrect current password', async () => {
      // Criação do usuário com senha configurada corretamente
      const user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash(currentPassword, 10),
      };

      // Mock para o serviço de busca do usuário
      mockUsersService.findById.mockResolvedValue(user);
      // Simula a comparação de senha falha
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(userId, 'wrongpassword', newPassword),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when user does not have a password', async () => {
      // Criação do usuário sem senha configurada
      const userWithoutPassword = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: null, // Senha não configurada
      };

      // Mock para o serviço de busca do usuário
      mockUsersService.findById.mockResolvedValue(userWithoutPassword);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(
        new HttpException(
          'Usuário não possue senha configurada',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate reset token for existing user', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('reset-token');
      mockEmailService.sendEmail.mockResolvedValue(true);
      mockConfigService.get.mockReturnValue('http://frontend.com');

      const result =
        await authService.generatePasswordResetToken('test@example.com');

      expect(result.message).toBe(
        'Se o email existir, um link de recuperação será enviado.',
      );
      expect(mockUsersService.updateUser).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    it('should return generic message for non-existent user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await authService.generatePasswordResetToken(
        'nonexistent@example.com',
      );

      expect(result.message).toBe(
        'Se o email existir, um link de recuperação será enviado.',
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      mockJwtService.verify.mockReturnValue({
        sub: user.id,
        email: user.email,
      });
      mockUsersService.findById.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await authService.resetPassword(
        'valid-token',
        'newpassword',
      );

      expect(result.message).toBe('Senha redefinida com sucesso.');
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(user.id, {
        password: 'hashed-new-password',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });

    it('should throw error for invalid token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'user-id',
        email: 'test@example.com',
      });
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        authService.resetPassword('invalid-token', 'newpassword'),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error for expired token', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        resetPasswordToken: 'expired-token',
        resetPasswordExpires: new Date(Date.now() - 3600000),
      };

      mockJwtService.verify.mockReturnValue({
        sub: user.id,
        email: user.email,
      });
      mockUsersService.findById.mockResolvedValue(user);

      await expect(
        authService.resetPassword('expired-token', 'newpassword'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('isProfileComplete', () => {
    it('should return true for complete profile', () => {
      const user = {
        cpf: '12345678900',
        genero: 'masculino',
        dateOfBirth: '1990-01-01',
        phone: '1234567890',
        name: 'Test User',
      };

      const result = (authService as any).isProfileComplete(user);
      expect(result).toBe(true);
    });

    it('should return false for incomplete profile', () => {
      const user = {
        cpf: '12345678900',
        genero: 'masculino',
        dateOfBirth: '1990-01-01',
        phone: '',
        name: '',
      };

      const result = (authService as any).isProfileComplete(user);
      expect(result).toBe(false);
    });
  });

  describe('validateJwtPayload', () => {
    it('should validate JWT payload', async () => {
      const payload = { email: 'test@example.com' };
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-id' });

      const result = await authService.validateJwtPayload(payload);

      expect(result).toEqual({ id: 'user-id' });
    });
  });
});
