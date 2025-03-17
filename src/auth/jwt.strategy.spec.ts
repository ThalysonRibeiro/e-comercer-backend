import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: UsersService;

  beforeEach(async () => {
    // Mocking the users service
    const usersServiceMock = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        name: 'testuser',
        email: 'test@test.com',
        status: AccountStatus.ativo, // Or AccountStatus.inativo for testing deactivated accounts
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('secret') } },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate a valid user', async () => {
    const payload = { sub: 1 }; // Mocking a JWT payload with a user ID
    const user = await jwtStrategy.validate(payload);
    expect(user).toEqual({
      id: 1,
      name: 'testuser',
      email: 'test@test.com',
      status: 'ativo',
    });
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    // Mocking a "user not found" scenario
    jest.spyOn(usersService, 'findById').mockResolvedValueOnce(null);

    const payload = { sub: 1 };
    await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user account is inactive', async () => {
    jest.spyOn(usersService, 'findById').mockResolvedValueOnce({
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      status: AccountStatus.inativo, // Conta inativa
      type: 'userdefault', // Tipo da conta
      cpf: '123.456.789-00', // CPF fictício
      genero: 'M', // Gênero fictício
      dateOfBirth: '1990-01-01', // Data fictícia
      phone: '123456789', // Telefone fictício
      password: null, // Senha fictícia
      createdAt: new Date(),
      updatedAt: new Date(),
      resetPasswordToken: null, // Propriedade faltante
      resetPasswordExpires: null, // Propriedade faltante
      emailVerified: null, // Propriedade do tipo Date | null, passando null
      emailVerificationToken: null, // Propriedade faltante
      googleId: 'some-google-id', // Adicionando googleId
      avatar: null, // Adicionando avatars
    });



    const payload = { sub: '1' };
    await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

});
