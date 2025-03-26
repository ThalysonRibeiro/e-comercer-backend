import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {
  AuthController,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.controller';
import { AuthService } from './auth.service';
import { AccountType } from '@prisma/client';
import {
  CreateUserAdminDTO,
  CreateUserDTO,
} from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  // Mock do serviço de autenticação
  const mockAuthService = {
    registerAdmin: jest.fn(),
    register: jest.fn(),
    loginWithCredentials: jest.fn(),
    validateGoogleToken: jest.fn(),
    authenticateWithGoogle: jest.fn(),
    changePassword: jest.fn(),
    generatePasswordResetToken: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerAdmin', () => {
    it('deve cadastrar um novo admin com sucesso', async () => {
      const adminData: CreateUserAdminDTO = {
        name: 'Admin Teste',
        email: 'admin@teste.com',
        password: 'senha123',
        cpf: '12345678900',
        phone: '11999887766',
        dateOfBirth: '1990-01-01',
        genero: 'masculino',
        type: 'useradmin',
        status: 'ativo',
        adminPassword: '123456789',
      };

      const expectedResult = {
        id: 1,
        name: 'Admin Teste',
        email: 'admin@teste.com',
        accountType: AccountType.useradmin,
      };

      mockAuthService.registerAdmin.mockResolvedValue(expectedResult);

      const result = await authController.registerAdmin(adminData);

      expect(authService.registerAdmin).toHaveBeenCalledWith(adminData);
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando o registro de admin falhar', async () => {
      const adminData: CreateUserAdminDTO = {
        name: 'Admin Teste',
        email: 'admin@teste.com',
        password: 'senha123',
        cpf: '12345678900',
        phone: '11999887766',
        dateOfBirth: '1990-01-01',
        genero: 'masculino',
        type: 'useradmin',
        status: 'ativo',
        adminPassword: '123456789',
      };

      mockAuthService.registerAdmin.mockRejectedValue(
        new HttpException('Email já cadastrado', HttpStatus.CONFLICT),
      );

      await expect(authController.registerAdmin(adminData)).rejects.toThrow(
        HttpException,
      );
      expect(authService.registerAdmin).toHaveBeenCalledWith(adminData);
    });
  });

  describe('loginAdmin', () => {
    it('deve autenticar um admin com sucesso', async () => {
      const credentials = {
        login: 'admin@teste.com',
        password: 'senha123',
      };

      const expectedResult = {
        accessToken: 'jwt-token-admin',
        user: {
          id: 1,
          name: 'Admin Teste',
          accountType: AccountType.useradmin,
        },
      };

      mockAuthService.loginWithCredentials.mockResolvedValue(expectedResult);

      const result = await authController.loginAdmin(credentials);

      expect(authService.loginWithCredentials).toHaveBeenCalledWith(
        credentials.login,
        credentials.password,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando credenciais de admin são inválidas', async () => {
      const credentials = {
        login: 'admin@teste.com',
        password: 'senha_errada',
      };

      mockAuthService.loginWithCredentials.mockRejectedValue(
        new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED),
      );

      await expect(authController.loginAdmin(credentials)).rejects.toThrow(
        HttpException,
      );
      expect(authService.loginWithCredentials).toHaveBeenCalledWith(
        credentials.login,
        credentials.password,
      );
    });
  });

  describe('getAdminData', () => {
    it('deve retornar dados protegidos para admins', () => {
      const result = authController.getAdminData();
      expect(result).toEqual({
        message: 'Esta é uma rota protegida apenas para administradores',
      });
    });
  });

  describe('register', () => {
    it('deve cadastrar um novo usuário comum com sucesso', async () => {
      const userData: CreateUserDTO = {
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        password: 'senha123',
        type: 'userdefault',
        dateOfBirth: '1992-03-28',
        phone: '123456784',
        status: 'ativo',
        cpf: '12345678900',
        genero: 'masculino',
      };

      const expectedResult = {
        id: 2,
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        accountType: AccountType.userdefault,
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(userData);

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando o registro de usuário falhar', async () => {
      const userData: CreateUserDTO = {
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        password: 'senha123',
        type: 'userdefault',
        dateOfBirth: '1992-03-28',
        phone: '123456784',
        status: 'ativo',
        cpf: '12345678900',
        genero: 'masculino',
      };

      mockAuthService.register.mockRejectedValue(
        new HttpException('Email já cadastrado', HttpStatus.CONFLICT),
      );

      await expect(authController.register(userData)).rejects.toThrow(
        HttpException,
      );
      expect(authService.register).toHaveBeenCalledWith(userData);
    });
  });

  describe('googleLogin', () => {
    it('deve autenticar um usuário via Google com sucesso', async () => {
      const googleData = {
        token: 'google-oauth-token',
      };

      const googlePayload = {
        email: 'usuario@gmail.com',
        name: 'Usuário Google',
        picture: 'https://exemplo.com/foto.jpg',
      };

      const expectedResult = {
        accessToken: 'jwt-token-google',
        user: {
          id: 3,
          name: 'Usuário Google',
          accountType: AccountType.userdefault,
        },
      };

      mockAuthService.validateGoogleToken.mockResolvedValue(googlePayload);
      mockAuthService.authenticateWithGoogle.mockResolvedValue(expectedResult);

      const result = await authController.googleLogin(googleData);

      expect(authService.validateGoogleToken).toHaveBeenCalledWith(
        googleData.token,
      );
      expect(authService.authenticateWithGoogle).toHaveBeenCalledWith(
        googlePayload,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando o token do Google é inválido', async () => {
      const googleData = {
        token: 'token-invalido',
      };

      mockAuthService.validateGoogleToken.mockRejectedValue(
        new HttpException('Token inválido', HttpStatus.UNAUTHORIZED),
      );

      await expect(authController.googleLogin(googleData)).rejects.toThrow(
        HttpException,
      );
      expect(authService.validateGoogleToken).toHaveBeenCalledWith(
        googleData.token,
      );
      expect(authService.authenticateWithGoogle).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve autenticar um usuário comum com sucesso', async () => {
      const credentials = {
        login: 'usuario@teste.com',
        password: 'senha123',
      };

      const expectedResult = {
        accessToken: 'jwt-token-user',
        user: {
          id: 2,
          name: 'Usuário Teste',
          accountType: AccountType.userdefault,
        },
      };

      mockAuthService.loginWithCredentials.mockResolvedValue(expectedResult);

      const result = await authController.login(credentials);

      expect(authService.loginWithCredentials).toHaveBeenCalledWith(
        credentials.login,
        credentials.password,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando credenciais de usuário são inválidas', async () => {
      const credentials = {
        login: 'usuario@teste.com',
        password: 'senha_errada',
      };

      mockAuthService.loginWithCredentials.mockRejectedValue(
        new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED),
      );

      await expect(authController.login(credentials)).rejects.toThrow(
        HttpException,
      );
      expect(authService.loginWithCredentials).toHaveBeenCalledWith(
        credentials.login,
        credentials.password,
      );
    });
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário autenticado', () => {
      const req = {
        user: {
          id: 2,
          name: 'Usuário Teste',
          email: 'usuario@teste.com',
          accountType: AccountType.userdefault,
        },
      };

      const result = authController.getProfile(req);
      expect(result).toEqual(req.user);
    });
  });

  describe('changePassword', () => {
    it('deve alterar a senha do usuário com sucesso', async () => {
      const req = {
        user: {
          id: 2,
          name: 'Usuário Teste',
        },
      };

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'senha_atual',
        newPassword: 'nova_senha',
      };

      const expectedResult = {
        message: 'Senha alterada com sucesso',
      };

      mockAuthService.changePassword.mockResolvedValue(expectedResult);

      const result = await authController.changePassword(
        req,
        changePasswordDto,
      );

      expect(authService.changePassword).toHaveBeenCalledWith(
        req.user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando a senha atual é incorreta', async () => {
      const req = {
        user: {
          id: 2,
          name: 'Usuário Teste',
        },
      };

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'senha_errada',
        newPassword: 'nova_senha',
      };

      mockAuthService.changePassword.mockRejectedValue(
        new HttpException('Senha atual incorreta', HttpStatus.UNAUTHORIZED),
      );

      await expect(
        authController.changePassword(req, changePasswordDto),
      ).rejects.toThrow(HttpException);
      expect(authService.changePassword).toHaveBeenCalledWith(
        req.user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
    });
  });

  describe('forgotPassword', () => {
    it('deve enviar email de redefinição de senha com sucesso', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'usuario@teste.com',
      };

      const expectedResult = {
        message: 'Email de redefinição enviado com sucesso',
      };

      mockAuthService.generatePasswordResetToken.mockResolvedValue(
        expectedResult,
      );

      const result = await authController.forgotPassword(forgotPasswordDto);

      expect(authService.generatePasswordResetToken).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando o email não está cadastrado', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'nao_existe@teste.com',
      };

      mockAuthService.generatePasswordResetToken.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(
        authController.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(NotFoundException);
      expect(authService.generatePasswordResetToken).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir a senha com token válido', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'token-valido-123',
        newPassword: 'nova_senha',
      };

      const expectedResult = {
        message: 'Senha redefinida com sucesso',
      };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await authController.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar exceção quando o token é inválido ou expirou', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'token-invalido',
        newPassword: 'nova_senha',
      };

      mockAuthService.resetPassword.mockRejectedValue(
        new HttpException('Token inválido ou expirado', HttpStatus.BAD_REQUEST),
      );

      await expect(
        authController.resetPassword(resetPasswordDto),
      ).rejects.toThrow(HttpException);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });
  });
});
