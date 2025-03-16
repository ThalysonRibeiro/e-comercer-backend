import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AccountStatus, AccountType, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';

// Mock do PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

// Mock do Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
    },
  },
}));

// Mock do fs/promises
jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              // Mock das variáveis de ambiente para os testes
              const envVars = {
                'CLOUDINARY_CLOUD_NAME': 'test-cloud-name',
                'CLOUDINARY_API_KEY': 'test-api-key',
                'CLOUDINARY_API_SECRET': 'test-api-secret',
              };
              return envVars[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  const mockUser: User = {
    id: 'user-123',
    email: 'teste@exemplo.com',
    name: 'Usuário Teste',
    password: 'hashedPassword',
    phone: '99999999999',
    cpf: '12345678900',
    genero: 'Masculino',
    dateOfBirth: '1990-01-01',
    avatar: null,
    googleId: null,
    status: AccountStatus.ativo,
    type: AccountType.userdefault,
    emailVerified: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    emailVerificationToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockUpdatedUser = {
    id: 'user-123',
    name: 'Usuário Teste',
    email: 'teste@exemplo.com',
    phone: '99999999999',
    avatar: 'https://res.cloudinary.com/demo/image/upload/avatars/user_123.jpg',
  };

  describe('findByEmail', () => {
    it('deve encontrar um usuário pelo email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('teste@exemplo.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando não encontrar um usuário pelo email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('naoexiste@exemplo.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'naoexiste@exemplo.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmailOrPhone', () => {
    it('deve encontrar um usuário pelo email ou telefone', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByEmailOrPhone('99999999999');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: '99999999999' }, { phone: '99999999999' }],
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando não encontrar um usuário pelo email ou telefone', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.findByEmailOrPhone('naoexiste');

      expect(result).toBeNull();
    });
  });

  describe('findByCPF', () => {
    it('deve encontrar um usuário pelo CPF', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByCPF('12345678900');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { cpf: '12345678900' },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando não encontrar um usuário pelo CPF', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.findByCPF('00000000000');

      expect(result).toBeNull();
    });
  });

  describe('findByGoogleId', () => {
    it('deve encontrar um usuário pelo Google ID', async () => {
      const userWithGoogleId = { ...mockUser, googleId: 'google-123' };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithGoogleId);

      const result = await service.findByGoogleId('google-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { googleId: 'google-123' },
      });
      expect(result).toEqual(userWithGoogleId);
    });

    it('deve retornar null quando não encontrar um usuário pelo Google ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByGoogleId('invalid-google-id');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('deve encontrar um usuário pelo ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando não encontrar um usuário pelo ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('deve criar um usuário com senha criptografada', async () => {
      const createUserDto: CreateUserDTO = {
        email: 'teste@exemplo.com',
        name: 'Usuário Teste',
        password: 'senha123',
        phone: '99999999999',
        cpf: '12345678900',
        genero: 'Masculino',
        dateOfBirth: '1990-01-01',
        status: AccountStatus.ativo,
        type: AccountType.userdefault,
      };

      const expectedCreatedUser = {
        ...mockUser,
        id: 'new-user-id',
        email: 'novo@exemplo.com',
        name: 'Novo Usuário',
      };

      mockPrismaService.user.create.mockResolvedValue(expectedCreatedUser);

      const result = await service.createUser(createUserDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 'salt');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...createUserDto, password: 'hashedPassword' },
      });
      expect(result).toEqual(expectedCreatedUser);
    });

    it('deve criar um usuário sem senha (para autenticação social)', async () => {
      const createUserDto: CreateUserDTO = {
        email: 'social@exemplo.com',
        name: 'Usuário Social',
        googleId: 'google-456',
        phone: '99999999999',
        cpf: '12345678900',
        genero: 'Masculino',
        dateOfBirth: '1990-01-01',
        status: AccountStatus.ativo,
        type: AccountType.userdefault,
        // password removido para usuários de autenticação social
      };

      const expectedCreatedUser = {
        ...mockUser,
        id: 'social-user-id',
        email: 'social@exemplo.com',
        name: 'Usuário Social',
        googleId: 'google-456',
        password: null,
      };

      mockPrismaService.user.create.mockResolvedValue(expectedCreatedUser);

      const result = await service.createUser(createUserDto);

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(result).toEqual(expectedCreatedUser);
    });
  });

  describe('updateUser', () => {
    it('deve atualizar os dados do usuário', async () => {
      const updateData = {
        name: 'Nome Atualizado',
        phone: '88888888888',
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser('user-123', updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('completeProfile', () => {
    it('deve completar o perfil do usuário', async () => {
      const profileData = {
        name: 'Nome Completo',
        cpf: '98765432100',
        genero: 'Feminino',
        dateOfBirth: '1995-05-15',
        phone: '77777777777',
      };

      const updatedUser = {
        ...mockUser,
        ...profileData,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.completeProfile('user-123', profileData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: profileData,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('uploadAvatarImage', () => {
    it('deve fazer upload de imagem de avatar local e atualizar o usuário', async () => {
      const req = { user: { id: 'user-123' } };
      const file = {
        originalname: 'avatar.jpg',
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-123',
        name: 'Usuário Teste',
        phone: '99999999999',
        email: 'teste@exemplo.com',
        avatar: 'user-123.jpg',
      });

      const result = await service.uploadAvatarImage(req, file);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { avatar: 'user-123.jpg' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
        },
      });
      expect(result).toEqual({
        id: 'user-123',
        name: 'Usuário Teste',
        phone: '99999999999',
        email: 'teste@exemplo.com',
        avatar: 'user-123.jpg',
      });
    });

    it('deve lançar uma exceção quando o usuário não for encontrado', async () => {
      const req = { user: { id: 'user-123' } };
      const file = {
        originalname: 'avatar.jpg',
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.uploadAvatarImage(req, file)).rejects.toThrow(HttpException);
    });

    it('deve lançar uma exceção quando ocorrer erro no upload', async () => {
      const req = { user: { id: 'user-123' } };
      const file = {
        originalname: 'avatar.jpg',
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockPrismaService.user.findFirst.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(service.uploadAvatarImage(req, file)).rejects.toThrow(HttpException);
    });
  });

  describe('uploadAvatarCloudnary', () => {
    it('deve fazer upload para o Cloudinary e atualizar o avatar do usuário com sucesso', async () => {
      // Mock da requisição
      const req = { user: { id: 'user-123' } };

      // Mock do arquivo
      const file = {
        buffer: Buffer.from('imagem-teste'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Mock do resultado do Cloudinary
      const cloudinaryResult = {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/avatars/user_123.jpg',
      };

      // Configurar mocks
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(cloudinaryResult);
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      // Executar método
      const result = await service.uploadAvatarCloudnary(req, file);

      // Verificações
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        'data:image/jpeg;base64,aW1hZ2VtLXRlc3Rl',
        {
          folder: 'avatars',
          public_id: 'user_user-123',
          overwrite: true,
          resource_type: 'image',
        }
      );

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { avatar: 'https://res.cloudinary.com/demo/image/upload/avatars/user_123.jpg' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
        },
      });

      expect(result).toEqual(mockUpdatedUser);
    });

    it('deve lançar HttpException quando o usuário não for encontrado', async () => {
      // Mock da requisição
      const req = { user: { id: 'user-123' } };

      // Mock do arquivo
      const file = {
        buffer: Buffer.from('imagem-teste'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Mock do resultado do Cloudinary
      const cloudinaryResult = {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/avatars/user_123.jpg',
      };

      // Configurar mocks
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(cloudinaryResult);
      mockPrismaService.user.findFirst.mockResolvedValue(null); // Usuário não encontrado

      // Verificar que o método lança exceção
      await expect(service.uploadAvatarCloudnary(req, file)).rejects.toThrow(
        new HttpException(
          'Falha ao atualizar o avatar do usuário',
          HttpStatus.BAD_REQUEST
        )
      );

      // Verificar que upload foi feito mas update não foi chamado
      expect(cloudinary.uploader.upload).toHaveBeenCalled();
      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar HttpException quando o upload no Cloudinary falhar', async () => {
      // Mock da requisição
      const req = { user: { id: 'user-123' } };

      // Mock do arquivo
      const file = {
        buffer: Buffer.from('imagem-teste'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Configurar mock para simular falha no Cloudinary
      (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(
        new Error('Erro no upload para o Cloudinary')
      );

      // Verificar que o método lança exceção
      await expect(service.uploadAvatarCloudnary(req, file)).rejects.toThrow(
        new HttpException(
          'Falha ao atualizar o avatar do usuário',
          HttpStatus.BAD_REQUEST
        )
      );

      // Verificar que não tentou buscar ou atualizar o usuário
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar HttpException quando atualização do usuário falhar', async () => {
      // Mock da requisição
      const req = { user: { id: 'user-123' } };

      // Mock do arquivo
      const file = {
        buffer: Buffer.from('imagem-teste'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Mock do resultado do Cloudinary
      const cloudinaryResult = {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/avatars/user_123.jpg',
      };

      // Configurar mocks
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(cloudinaryResult);
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockRejectedValue(
        new Error('Erro ao atualizar usuário no banco de dados')
      );

      // Verificar que o método lança exceção
      await expect(service.uploadAvatarCloudnary(req, file)).rejects.toThrow(
        new HttpException(
          'Falha ao atualizar o avatar do usuário',
          HttpStatus.BAD_REQUEST
        )
      );

      // Verificar que tentou fazer upload e buscar o usuário
      expect(cloudinary.uploader.upload).toHaveBeenCalled();
      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('deve lidar com formatos diferentes de imagem', async () => {
      // Mock da requisição
      const req = { user: { id: 'user-123' } };

      // Mock do arquivo PNG
      const filePng = {
        buffer: Buffer.from('imagem-teste-png'),
        mimetype: 'image/png',
      } as Express.Multer.File;

      // Mock do resultado do Cloudinary
      const cloudinaryResult = {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/avatars/user_123.png',
      };

      // Configurar mocks
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(cloudinaryResult);
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        avatar: 'https://res.cloudinary.com/demo/image/upload/avatars/user_123.png',
      });

      // Executar método
      await service.uploadAvatarCloudnary(req, filePng);

      // Verificar que o dataURI contém o mimetype correto
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        'data:image/png;base64,aW1hZ2VtLXRlc3RlLXBuZw==',
        expect.any(Object)
      );
    });
  });

})