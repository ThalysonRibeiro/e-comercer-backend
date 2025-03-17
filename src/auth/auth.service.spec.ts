// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { UsersService } from '../users/users.service';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { EmailService } from '../email/email.service';
// import { HttpException, HttpStatus } from '@nestjs/common';
// import { AccountStatus, AccountType } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// describe('AuthService', () => {
//   let service: AuthService;
//   let usersService: UsersService;
//   let jwtService: JwtService;
//   let configService: ConfigService;
//   let emailService: EmailService;

//   const mockUser = {
//     id: '1',
//     email: 'test@example.com',
//     name: 'Test User',
//     password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
//     status: AccountStatus.ativo,
//     type: AccountType.userdefault,
//     avatar: null,
//     cpf: '12345678900',
//     genero: 'masculino',
//     dateOfBirth: '1990-01-01',
//     phone: '11999887766',
//     resetPasswordToken: null,
//     resetPasswordExpires: null,
//     emailVerificationToken: 'some-token',
//     isEmailVerified: false,
//     googleId: null,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   const mockAdminUser = {
//     ...mockUser,
//     id: '2',
//     email: 'admin@example.com',
//     type: AccountType.useradmin,
//   };

//   const mockUsersService = {
//     findByEmail: jest.fn(),
//     findByEmailOrPhone: jest.fn(),
//     findByCPF: jest.fn(),
//     createUser: jest.fn(),
//     findByGoogleId: jest.fn(),
//     findById: jest.fn(),
//     updateUser: jest.fn(),
//   };

//   const mockJwtService = {
//     sign: jest.fn().mockReturnValue('test-token'),
//     verify: jest.fn(),
//   };

//   const mockConfigService = {
//     get: jest.fn(),
//   };

//   const mockEmailService = {
//     sendEmail: jest.fn().mockResolvedValue(true),
//   };

//   beforeEach(async () => {
//     jest.clearAllMocks();

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: UsersService,
//           useValue: mockUsersService,
//         },
//         {
//           provide: JwtService,
//           useValue: mockJwtService,
//         },
//         {
//           provide: ConfigService,
//           useValue: mockConfigService,
//         },
//         {
//           provide: EmailService,
//           useValue: mockEmailService,
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     usersService = module.get<UsersService>(UsersService);
//     jwtService = module.get<JwtService>(JwtService);
//     configService = module.get<ConfigService>(ConfigService);
//     emailService = module.get<EmailService>(EmailService);

//     // Configurações padrão
//     mockConfigService.get.mockImplementation((key) => {
//       const configs = {
//         GOOGLE_CLIENT_ID: 'test-google-client-id',
//         FRONTEND_URL: 'http://localhost:3001',
//         ADMIN_PASSWORD: 'admin123',
//       };
//       return configs[key];
//     });
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('register', () => {
//     const createUserDto = {
//       email: 'new@example.com',
//       name: 'New User',
//       password: 'password123',
//       cpf: '11122233344',
//       genero: 'masculino',
//       dateOfBirth: '1990-01-01',
//       phone: '11999887766',
//       status: "ativo",
//       type: "userdefault",
//     };

//     it('should register a new user successfully', async () => {
//       // Mock de usuário não encontrado (email, telefone e CPF únicos)
//       mockUsersService.findByEmail.mockResolvedValue(null);
//       mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
//       mockUsersService.findByCPF.mockResolvedValue(null);

//       // Mock da criação do usuário
//       const newUser = { ...mockUser, email: createUserDto.email, name: createUserDto.name };
//       mockUsersService.createUser.mockResolvedValue(newUser);

//       const result = await service.register(createUserDto);

//       // Verificações
//       expect(mockUsersService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
//       expect(mockUsersService.findByEmailOrPhone).toHaveBeenCalledWith(createUserDto.phone);
//       expect(mockUsersService.findByCPF).toHaveBeenCalledWith(createUserDto.cpf);
//       expect(mockUsersService.createUser).toHaveBeenCalled();
//       expect(mockEmailService.sendEmail).toHaveBeenCalled();
//       expect(mockJwtService.sign).toHaveBeenCalled();

//       expect(result).toHaveProperty('user');
//       expect(result).toHaveProperty('accessToken', 'test-token');
//       expect(result.user).toHaveProperty('id', newUser.id);
//       expect(result.user).toHaveProperty('email', newUser.email);
//       expect(result.user).toHaveProperty('isProfileComplete', true);
//     });

//     it('should return error message if email, phone or CPF already exists', async () => {
//       // Simular que o email já existe
//       mockUsersService.findByEmail.mockResolvedValue(mockUser);
//       mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
//       mockUsersService.findByCPF.mockResolvedValue(null);

//       const result = await service.register(createUserDto);

//       expect(result).toEqual({ message: 'email, telefone ou cpf já existe' });
//       expect(mockUsersService.createUser).not.toHaveBeenCalled();
//       expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
//     });

//     it('should throw exception if email sending fails', async () => {
//       // Mock de usuário não encontrado (email, telefone e CPF únicos)
//       mockUsersService.findByEmail.mockResolvedValue(null);
//       mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
//       mockUsersService.findByCPF.mockResolvedValue(null);

//       // Mock da criação do usuário
//       const newUser = { ...mockUser, email: createUserDto.email, name: createUserDto.name };
//       mockUsersService.createUser.mockResolvedValue(newUser);

//       // Simular falha no envio de email
//       mockEmailService.sendEmail.mockRejectedValue(new Error('Email error'));

//       await expect(service.register(createUserDto)).rejects.toThrow(HttpException);
//       await expect(service.register(createUserDto)).rejects.toThrow('Erro ao enviar email de confirmação:');
//     });
//   });

//   describe('registerAdmin', () => {
//     const createAdminDto = {
//       email: 'admin@example.com',
//       name: 'Admin User',
//       password: 'admin123',
//       cpf: '11122233355',
//       genero: 'masculino',
//       dateOfBirth: '1990-01-01',
//       phone: '11999887777',
//       adminPassword: 'admin123',
//     };

//     it('should register a new admin successfully', async () => {
//       // Mock de usuário não encontrado (email, telefone e CPF únicos)
//       mockUsersService.findByEmail.mockResolvedValue(null);
//       mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
//       mockUsersService.findByCPF.mockResolvedValue(null);

//       // Mock da criação do usuário admin
//       mockUsersService.createUser.mockResolvedValue(mockAdminUser);

//       const result = await service.registerAdmin(createAdminDto);

//       // Verificações
//       expect(mockConfigService.get).toHaveBeenCalledWith('ADMIN_PASSWORD');
//       expect(mockUsersService.findByEmail).toHaveBeenCalledWith(createAdminDto.email);
//       expect(mockUsersService.createUser).toHaveBeenCalled();
//       expect(mockEmailService.sendEmail).toHaveBeenCalled();
//       expect(mockJwtService.sign).toHaveBeenCalled();

//       expect(result).toHaveProperty('user');
//       expect(result).toHaveProperty('accessToken', 'test-token');
//       expect(result.user).toHaveProperty('type', AccountType.useradmin);
//     });

//     it('should throw exception if admin password is incorrect', async () => {
//       const invalidAdminDto = { ...createAdminDto, adminPassword: 'wrong-password' };

//       await expect(service.registerAdmin(invalidAdminDto)).rejects.toThrow(HttpException);
//       await expect(service.registerAdmin(invalidAdminDto)).rejects.toThrow('Senha de administrador incorreta.');
//       expect(mockUsersService.createUser).not.toHaveBeenCalled();
//     });

//     it('should throw exception if email, phone or CPF already exists', async () => {
//       // Simular que o email já existe
//       mockUsersService.findByEmail.mockResolvedValue(mockUser);

//       await expect(service.registerAdmin(createAdminDto)).rejects.toThrow(HttpException);
//       await expect(service.registerAdmin(createAdminDto)).rejects.toThrow('Email, telefone ou CPF já existe.');
//       expect(mockUsersService.createUser).not.toHaveBeenCalled();
//     });
//   });

//   describe('validateGoogleToken', () => {
//     it('should validate a Google token successfully', async () => {
//       // Mock do método verifyIdToken dentro do googleClient
//       const originalGoogleClient = (service as any).googleClient;
//       const mockVerifyIdToken = jest.fn().mockResolvedValue({
//         getPayload: () => ({
//           sub: 'google-id-123',
//           email: 'user@gmail.com',
//           name: 'Google User',
//           picture: 'https://example.com/photo.jpg',
//         }),
//       });

//       (service as any).googleClient = {
//         verifyIdToken: mockVerifyIdToken,
//       };

//       const result = await service.validateGoogleToken('valid-google-token');

//       expect(mockVerifyIdToken).toHaveBeenCalledWith({
//         idToken: 'valid-google-token',
//         audience: 'test-google-client-id',
//       });

//       expect(result).toHaveProperty('email', 'user@gmail.com');
//       expect(result).toHaveProperty('sub', 'google-id-123');

//       // Restaurar o client original
//       (service as any).googleClient = originalGoogleClient;
//     });

//     it('should throw exception if Google token verification fails', async () => {
//       // Mock do método verifyIdToken dentro do googleClient
//       const originalGoogleClient = (service as any).googleClient;
//       const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

//       (service as any).googleClient = {
//         verifyIdToken: mockVerifyIdToken,
//       };

//       await expect(service.validateGoogleToken('invalid-token')).rejects.toThrow('Falha na verificação do token Google');

//       // Restaurar o client original
//       (service as any).googleClient = originalGoogleClient;
//     });
//   });

//   describe('authenticateWithGoogle', () => {
//     const googlePayload = {
//       sub: 'google-id-123',
//       email: 'user@gmail.com',
//       name: 'Google User',
//       picture: 'https://example.com/photo.jpg',
//     };

//     it('should authenticate existing user with Google ID', async () => {
//       // Usuário já existe com googleId
//       mockUsersService.findByGoogleId.mockResolvedValue(mockUser);

//       const result = await service.authenticateWithGoogle(googlePayload);

//       expect(mockUsersService.findByGoogleId).toHaveBeenCalledWith(googlePayload.sub);
//       expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
//       expect(mockUsersService.createUser).not.toHaveBeenCalled();
//       expect(result).toHaveProperty('accessToken');
//       expect(result).toHaveProperty('user');
//     });

//     it('should update existing user with Google info if email exists', async () => {
//       // Usuário não existe com googleId, mas existe com email
//       mockUsersService.findByGoogleId.mockResolvedValue(null);
//       mockUsersService.findByEmail.mockResolvedValue(mockUser);
//       mockUsersService.updateUser.mockResolvedValue({ ...mockUser, googleId: googlePayload.sub });

//       const result = await service.authenticateWithGoogle(googlePayload);

//       expect(mockUsersService.findByGoogleId).toHaveBeenCalledWith(googlePayload.sub);
//       expect(mockUsersService.findByEmail).toHaveBeenCalledWith(googlePayload.email);
//       expect(mockUsersService.updateUser).toHaveBeenCalledWith(mockUser.id, {
//         googleId: googlePayload.sub,
//         name: googlePayload.name,
//         avatar: googlePayload.picture,
//       });
//       expect(mockUsersService.createUser).not.toHaveBeenCalled();
//       expect(result).toHaveProperty('accessToken');
//     });

//     it('should create new user if no existing user is found', async () => {
//       // Nem googleId nem email existem
//       mockUsersService.findByGoogleId.mockResolvedValue(null);
//       mockUsersService.findByEmail.mockResolvedValue(null);
//       const newGoogleUser = {
//         ...mockUser,
//         googleId: googlePayload.sub,
//         email: googlePayload.email,
//         name: googlePayload.name,
//         avatar: googlePayload.picture,
//       };
//       mockUsersService.createUser.mockResolvedValue(newGoogleUser);

//       const result = await service.authenticateWithGoogle(googlePayload);

//       expect(mockUsersService.findByGoogleId).toHaveBeenCalledWith(googlePayload.sub);
//       expect(mockUsersService.findByEmail).toHaveBeenCalledWith(googlePayload.email);
//       expect(mockUsersService.createUser).toHaveBeenCalledWith(expect.objectContaining({
//         email: googlePayload.email,
//         name: googlePayload.name,
//         googleId: googlePayload.sub,
//         avatar: googlePayload.picture,
//       }));
//       expect(result).toHaveProperty('accessToken');
//     });

//     it('should throw exception if user account is inactive', async () => {
//       // Usuário existe mas está inativo
//       const inactiveUser = { ...mockUser, status: AccountStatus.inativo };
//       mockUsersService.findByGoogleId.mockResolvedValue(inactiveUser);

//       await expect(service.authenticateWithGoogle(googlePayload)).rejects.toThrow('Conta inativa. Entre em contato com o administrador.');
//     });
//   });
// });

// // describe('loginWithCredentials', () => {
// //   it('should login successfully with correct credentials', async () => {
// //     // Mock para encontrar usuário pelo email
// //     mockUs


import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AccountStatus, AccountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let emailService: EmailService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByEmailOrPhone: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    findByCPF: jest.fn(),
    findByGoogleId: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve lançar exceção se o email já existe', async () => {
      const createUserDTO: CreateUserDTO = {
        email: 'test@example.com',
        name: 'Teste Usuário',
        password: 'senha123',
        cpf: '12345678900',
        genero: 'masculino',
        dateOfBirth: '1990-01-01',
        phone: '11999887766',
        status: AccountStatus.ativo,
        type: AccountType.userdefault,
      };

      // Simula que o email já existe
      mockUsersService.findByEmail.mockResolvedValue(true);  // Simula que o email existe
      mockUsersService.findByEmailOrPhone.mockResolvedValue(false); // Simula que o telefone não existe
      mockUsersService.findByCPF.mockResolvedValue(false); // Simula que o CPF não existe

      // Verifica se a exceção é lançada
      await expect(authService.register(createUserDTO)).rejects.toThrow(HttpException);
      await expect(authService.register(createUserDTO)).rejects.toThrow('email, telefone ou cpf já existe');
    });
  });

  describe('loginWithCredentials', () => {
    it('deve autenticar um usuário com sucesso', async () => {
      const credentials = {
        login: 'usuario@teste.com',
        password: 'senha123',
      };

      const user = {
        id: 1,
        email: credentials.login,
        password: await bcrypt.hash(credentials.password, 10),
      };

      mockUsersService.findByEmailOrPhone.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await authService.loginWithCredentials(credentials.login, credentials.password);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user,
      });
    });

    it('deve lançar exceção quando as credenciais são inválidas', async () => {
      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);

      await expect(authService.loginWithCredentials('usuario@teste.com', 'senha_errada')).rejects.toThrow(HttpException);
    });
  });

  describe('changePassword', () => {
    it('deve alterar a senha com sucesso', async () => {
      const userId = '1';
      const currentPassword = 'senha_atual';
      const newPassword = 'nova_senha';

      const user = {
        id: userId,
        email: 'usuario@teste.com',
        password: await bcrypt.hash(currentPassword, 10),
      };

      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.updateUser.mockResolvedValue(null);
      mockEmailService.sendEmail.mockResolvedValue(null);

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      expect(usersService.updateUser).toHaveBeenCalledWith(userId, { password: expect.any(String) });
      expect(result).toEqual({ message: 'Senha alterada com sucesso.' });
    });

    it('deve lançar exceção se a senha atual estiver incorreta', async () => {
      const userId = '1';
      const currentPassword = 'senha_errada';
      const newPassword = 'nova_senha';

      const user = {
        id: userId,
        email: 'usuario@teste.com',
        password: await bcrypt.hash('senha_atual', 10),
      };

      mockUsersService.findById.mockResolvedValue(user);

      await expect(authService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(HttpException);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('deve gerar um token de redefinição de senha e enviar email', async () => {
      const email = 'usuario@teste.com';
      const user = { id: '1', email: email, name: 'Usuário' };

      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('reset-token');
      mockEmailService.sendEmail.mockResolvedValue(null);

      const result = await authService.generatePasswordResetToken(email);

      expect(usersService.updateUser).toHaveBeenCalledWith(user.id, expect.objectContaining({ resetPasswordToken: 'reset-token' }));
      expect(result).toEqual({ message: 'Se o email existir, um link de recuperação será enviado.' });
    });

    it('deve lançar exceção se o email não existir', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await authService.generatePasswordResetToken('inexistente@teste.com');

      expect(result).toEqual({ message: 'Se o email existir, um link de recuperação será enviado.' });
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir a senha com sucesso', async () => {
      const token = 'reset-token';
      const newPassword = 'nova_senha';

      const user = {
        id: '1',
        email: 'usuario@teste.com',
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      mockJwtService.verify.mockReturnValue({ sub: user.id });
      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.updateUser.mockResolvedValue(null);
      mockEmailService.sendEmail.mockResolvedValue(null);

      const result = await authService.resetPassword(token, newPassword);

      expect(usersService.updateUser).toHaveBeenCalledWith(user.id, expect.objectContaining({ password: expect.any(String) }));
      expect(result).toEqual({ message: 'Senha redefinida com sucesso.' });
    });

    it('deve lançar exceção se o token for inválido', async () => {
      const token = 'invalid-token';
      const newPassword = 'nova_senha';

      mockJwtService.verify.mockImplementation(() => { throw new HttpException('Token inválido.', HttpStatus.BAD_REQUEST); });

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(HttpException);
    });
  });
});