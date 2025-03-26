import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Mock para o nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let mockTransporter: any;

  // Mock do ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const configs = {
        MAIL_HOST: 'smtp.example.com',
        MAIL_PORT: '587',
        MAIL_USER: 'test@example.com',
        MAIL_PASS: 'password123',
      };
      return configs[key];
    }),
  };

  // Mock do PrismaService
  const mockPrismaService = {};

  beforeEach(async () => {
    // Criar um mock do transportador
    mockTransporter = {
      sendMail: jest.fn().mockImplementation((mailOptions) => {
        return Promise.resolve({
          messageId: 'mock-message-id',
          envelope: { from: mailOptions.from, to: mailOptions.to },
        });
      }),
    };

    // Mock do nodemailer.createTransport para retornar nosso transportador mock
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a transporter with correct config', () => {
    // Verificar se nodemailer.createTransport foi chamado com as configurações corretas
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: '587',
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password123',
      },
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      // Arrange
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test email body';
      const html = '<p>Test email body</p>';

      // Act
      await service.sendEmail(to, subject, text, html);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"POWER GADGET" <rafinha.head@gmail.com>',
        to,
        subject,
        text,
        html,
      });
    });

    it('should send email with only text content', async () => {
      // Arrange
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test email body';

      // Act
      await service.sendEmail(to, subject, text);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"POWER GADGET" <rafinha.head@gmail.com>',
        to,
        subject,
        text,
        html: undefined,
      });
    });

    it('should throw error if sending email fails', async () => {
      // Arrange
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test email body';
      const errorMessage = 'Failed to send email';

      // Mock para simular erro no envio
      mockTransporter.sendMail.mockRejectedValue(new Error(errorMessage));

      // Spy no console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(service.sendEmail(to, subject, text)).rejects.toThrow(
        errorMessage,
      );
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro ao enviar o e-mail:',
        expect.any(Error),
      );

      // Restaurar o console.error
      consoleSpy.mockRestore();
    });
  });
});
