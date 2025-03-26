import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerificationService } from './email-verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let prismaService: PrismaService;
  let emailService: EmailService;
  let configService: ConfigService;

  // Mocks
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailVerificationService>(EmailVerificationService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        emailVerificationToken: null,
      };
      const mockFrontendUrl = 'http://localhost:3000';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        emailVerificationToken: 'mock-token',
      });
      mockConfigService.get.mockReturnValue(mockFrontendUrl);
      mockEmailService.sendEmail.mockResolvedValue(true);

      // Act
      const result = await service.sendVerificationEmail(userId);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          emailVerificationToken: expect.any(String),
        }),
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        mockUser.email,
        'Confirmação de Email - POWER GADGET',
        expect.stringContaining(mockFrontendUrl),
        expect.stringContaining(mockFrontendUrl),
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.sendVerificationEmail(userId)).rejects.toThrow(
        'Usuário não encontrado',
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle email service failure', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        emailVerificationToken: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        emailVerificationToken: 'mock-token',
      });
      mockConfigService.get.mockReturnValue('http://localhost:3000');
      mockEmailService.sendEmail.mockRejectedValue(
        new Error('Email sending failed'),
      );

      // Act & Assert
      await expect(service.sendVerificationEmail(userId)).rejects.toThrow(
        'Email sending failed',
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const token = 'valid-token';
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        emailVerificationToken: token,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        emailVerified: new Date(),
        emailVerificationToken: null,
      });

      // Act
      const result = await service.verifyEmail(token);

      // Assert
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerificationToken: token },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          emailVerified: expect.any(Date),
          emailVerificationToken: null,
        },
      });
      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({
          id: mockUser.id,
          emailVerified: expect.any(Date),
          emailVerificationToken: null,
        }),
      });
    });

    it('should throw error if token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail(token)).rejects.toThrow(
        'Token inválido ou expirado',
      );
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerificationToken: token },
      });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email successfully', async () => {
      // Arrange
      const token = 'valid-token';
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        emailVerificationToken: token,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        emailVerified: new Date(),
        emailVerificationToken: null,
      });

      // Act
      const result = await service.confirmEmail(token);

      // Assert
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerificationToken: token },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          emailVerified: expect.any(Date),
          emailVerificationToken: null,
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw HttpException if token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.confirmEmail(token)).rejects.toThrow(
        new HttpException(
          'Token inválido ou expirado.',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerificationToken: token },
      });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw HttpException if email already verified', async () => {
      // Arrange
      const token = 'valid-token';
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date(), // Already verified
        emailVerificationToken: token,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.confirmEmail(token)).rejects.toThrow(
        new HttpException(
          'Este email já foi confirmado.',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerificationToken: token },
      });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
