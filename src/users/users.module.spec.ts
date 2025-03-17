import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from './users.module';
import { ConfigModule } from '@nestjs/config'; // Importando o ConfigModule para testes

describe('UsersModule', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, ConfigModule.forRoot()], // Adicionando ConfigModule
      providers: [UsersService, PrismaService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });
});
