import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('EmailVerificationController', () => {
  let controller: EmailVerificationController;
  let emailVerificationService: EmailVerificationService;

  // Mock do serviço
  const mockEmailVerificationService = {
    sendVerificationEmail: jest.fn(),
    verifyEmail: jest.fn(),
    confirmEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailVerificationController],
      providers: [
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EmailVerificationController>(
      EmailVerificationController,
    );
    emailVerificationService = module.get<EmailVerificationService>(
      EmailVerificationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendVerification', () => {
    it('should call service to send verification email', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedResult = { success: true };
      mockEmailVerificationService.sendVerificationEmail.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.sendVerification({ userId });

      // Assert
      expect(
        emailVerificationService.sendVerificationEmail,
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate error from service', async () => {
      // Arrange
      const userId = 'user-123';
      const errorMessage = 'Usuário não encontrado';
      mockEmailVerificationService.sendVerificationEmail.mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(controller.sendVerification({ userId })).rejects.toThrow(
        errorMessage,
      );
      expect(
        emailVerificationService.sendVerificationEmail,
      ).toHaveBeenCalledWith(userId);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const token = 'valid-token';
      const serviceResult = { success: true, user: { id: 'user-123' } };
      mockEmailVerificationService.verifyEmail.mockResolvedValue(serviceResult);

      // Act
      const result = await controller.verifyEmail(token);

      // Assert
      expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        success: true,
        message: 'Email verificado com sucesso!',
      });
    });

    it('should throw HttpException if token is not provided', async () => {
      // Act & Assert
      await expect(controller.verifyEmail('')).rejects.toThrow(
        new HttpException('Token não fornecido', HttpStatus.BAD_REQUEST),
      );
      expect(emailVerificationService.verifyEmail).not.toHaveBeenCalled();
    });

    it('should throw HttpException if token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';
      mockEmailVerificationService.verifyEmail.mockRejectedValue(
        new Error('Token inválido ou expirado'),
      );

      // Act & Assert
      await expect(controller.verifyEmail(token)).rejects.toThrow(
        new HttpException('Token inválido ou expirado', HttpStatus.BAD_REQUEST),
      );
      expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it('should throw HttpException for other errors', async () => {
      // Arrange
      const token = 'valid-token';
      mockEmailVerificationService.verifyEmail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(controller.verifyEmail(token)).rejects.toThrow(
        new HttpException(
          'Erro ao verificar email',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith(token);
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email successfully', async () => {
      // Arrange
      const token = 'valid-token';
      const expectedResult = { success: true };
      mockEmailVerificationService.confirmEmail.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.confirmEmail({ token });

      // Assert
      expect(emailVerificationService.confirmEmail).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate HttpException from service', async () => {
      // Arrange
      const token = 'invalid-token';
      const httpException = new HttpException(
        'Token inválido ou expirado.',
        HttpStatus.BAD_REQUEST,
      );
      mockEmailVerificationService.confirmEmail.mockRejectedValue(
        httpException,
      );

      // Act & Assert
      await expect(controller.confirmEmail({ token })).rejects.toThrow(
        httpException,
      );
      expect(emailVerificationService.confirmEmail).toHaveBeenCalledWith(token);
    });
  });
});
