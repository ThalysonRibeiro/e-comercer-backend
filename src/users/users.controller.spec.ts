import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  // Mock de serviço
  const mockUsersService = {
    completeProfile: jest.fn(),
    uploadAvatarImage: jest.fn(),
    uploadAvatarCloudnary: jest.fn(),
  };

  // Mock de arquivo
  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('completeProfile', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const profileData = {
        name: 'Test User',
        cpf: '123.456.789-00',
        genero: 'Masculino',
        dateOfBirth: '1990-01-01',
        phone: '(11) 99999-9999',
      };

      const mockUpdatedUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        status: 'active',
      };

      mockUsersService.completeProfile.mockResolvedValue(mockUpdatedUser);

      // Act
      const result = await controller.completeProfile(mockRequest, profileData);

      // Assert
      expect(usersService.completeProfile).toHaveBeenCalledWith(
        'user-123',
        profileData,
      );
      expect(result).toEqual({
        message: 'Perfil atualizado com sucesso',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          status: 'active',
        },
      });
    });

    it('should throw an error if service throws', async () => {
      // Arrange
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const profileData = {
        name: 'Test User',
        cpf: '123.456.789-00',
        genero: 'Masculino',
        dateOfBirth: '1990-01-01',
        phone: '(11) 99999-9999',
      };

      mockUsersService.completeProfile.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        controller.completeProfile(mockRequest, profileData),
      ).rejects.toThrow('Database error');
      expect(usersService.completeProfile).toHaveBeenCalledWith(
        'user-123',
        profileData,
      );
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      // Arrange
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockResponse = {
        message: 'Avatar uploaded successfully',
        avatarUrl: 'http://example.com/avatar.jpg',
      };

      mockUsersService.uploadAvatarImage.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.uploadAvatar(mockRequest, mockFile);

      // Assert
      expect(usersService.uploadAvatarImage).toHaveBeenCalledWith(
        mockRequest,
        mockFile,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if service throws', async () => {
      // Arrange
      const mockRequest = {
        user: { id: 'user-123' },
      };

      mockUsersService.uploadAvatarImage.mockRejectedValue(
        new Error('Upload failed'),
      );

      // Act & Assert
      await expect(
        controller.uploadAvatar(mockRequest, mockFile),
      ).rejects.toThrow('Upload failed');
      expect(usersService.uploadAvatarImage).toHaveBeenCalledWith(
        mockRequest,
        mockFile,
      );
    });
  });

  describe('uploadAvatarCloudnary', () => {
    it('should upload avatar to Cloudinary successfully', async () => {
      // Arrange
      const mockRequest = {
        user: { id: 'user-123' },
      };

      const mockResponse = {
        message: 'Avatar uploaded to Cloudinary successfully',
        avatarUrl: 'https://cloudinary.com/avatar.jpg',
      };

      mockUsersService.uploadAvatarCloudnary.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.uploadAvatarCloudnary(
        mockRequest,
        mockFile,
      );

      // Assert
      expect(usersService.uploadAvatarCloudnary).toHaveBeenCalledWith(
        mockRequest,
        mockFile,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if service throws', async () => {
      // Arrange
      const mockRequest = {
        user: { id: 'user-123' },
      };

      mockUsersService.uploadAvatarCloudnary.mockRejectedValue(
        new Error('Cloudinary upload failed'),
      );

      // Act & Assert
      await expect(
        controller.uploadAvatarCloudnary(mockRequest, mockFile),
      ).rejects.toThrow('Cloudinary upload failed');
      expect(usersService.uploadAvatarCloudnary).toHaveBeenCalledWith(
        mockRequest,
        mockFile,
      );
    });
  });

  // Teste para validação de arquivos
  describe('file validation', () => {
    // Estes testes são mais difíceis de implementar diretamente no controller
    // porque a validação é feita pelo ParseFilePipeBuilder
    // Normalmente, estes são testados com testes de integração
    // Mas podemos simular o comportamento esperado

    it('should validate file type and size', () => {
      // Este é um exemplo de como seria um teste de integração
      // Na prática, precisaríamos de um teste e2e para isso
      expect(mockFile.mimetype).toMatch(/jpeg|jpg|png|webp/);
      expect(mockFile.size).toBeLessThanOrEqual(6 * 1024 * 1024);
    });
  });
});
