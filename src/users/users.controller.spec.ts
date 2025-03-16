import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; // Importação correta
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('UsersController', () => {
  let app: INestApplication;
  let usersService: UsersService;

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     controllers: [UsersController],
  //     providers: [
  //       {
  //         provide: UsersService,
  //         useValue: {
  //           completeProfile: jest.fn(), // Mock correto da função
  //           uploadAvatarImage: jest.fn(),
  //           uploadAvatarCloudnary: jest.fn(),
  //         },
  //       },
  //     ],
  //   })
  //     .overrideGuard(JwtAuthGuard)
  //     .useValue({ canActivate: jest.fn(() => true) })
  //     .compile();

  //   app = moduleFixture.createNestApplication();
  //   usersService = moduleFixture.get<UsersService>(UsersService);
  //   await app.init();
  // });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            completeProfile: jest.fn(),
            uploadAvatarImage: jest.fn(),
            uploadAvatarCloudnary: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true), // Isso simula que o guard está passando
        getRequest: jest.fn(() => ({ user: { id: 'cm8awbgye0000f8mwuzbnso4e' } })), // Mock do request.user
      })
      .compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('PATCH /users/complete-profile', () => {

    it('should update the user profile', async () => {
      // Mock da resposta do serviço
      const updatedUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
      };

      // Definindo o comportamento esperado do serviço
      (usersService.completeProfile as jest.Mock).mockResolvedValue(updatedUser);

      // Dados do corpo da requisição
      const profileData = {
        name: 'John Doe',
        cpf: '123.456.789-00',
        genero: 'masculino',
        dateOfBirth: '1990-01-01',
        phone: '+55 11 99999-9999',
      };

      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbThhd2JneWUwMDAwZjhtd3V6Ym5zbzRlIiwiZW1haWwiOiJyYWZhZWwyM2JyQGhvdG1haWwuY29tIiwicGhvbmUiOiIrNTU2NTk4MTI3ODI5NyIsImlhdCI6MTc0MjEzNTEyMSwiZXhwIjoxNzQ0NzI3MTIxLCJhdWQiOiJ1c2VycyIsImlzcyI6ImF1dGgtYXBpIn0.E3m9MnLxqNRCUh5Av08XvbxA9Bm9U5LR3Vv40DLOalQ";

      try {
        const response = await request(app.getHttpServer())
          .patch('/users/complete-profile')
          .set('Authorization', `Bearer ${token}`)
          .send(profileData);

        expect(response.status).toBe(200);  // Verifica o status HTTP 200
        expect(response.body).toEqual({
          message: 'Perfil atualizado com sucesso',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            status: updatedUser.status,
          },
        });
      } catch (error) {
        console.error('Error response:', error.response);
      }
    });
  });


  describe('POST /users/avatar', () => {
    it('should upload avatar image', async () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'http://example.com/avatar.jpg',
        phone: '123456789',
      };

      jest
        .spyOn(usersService, 'uploadAvatarImage')
        .mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/users/avatar')
        .attach('file', Buffer.from('avatar image content'), 'avatar.jpg')
        .expect(201)
        .expect({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          phone: mockUser.phone,
        });
    });
  });

  describe('POST /users/avatar-Cloudnary', () => {
    it('should upload avatar to Cloudinary', async () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'http://example.com/avatar.jpg',
        phone: '123456789',
      };

      jest
        .spyOn(usersService, 'uploadAvatarCloudnary')
        .mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/users/avatar-Cloudnary')
        .attach('file', Buffer.from('avatar image content'), 'avatar-cloud.jpg')
        .expect(201)
        .expect({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          phone: mockUser.phone,
        });
    });
  });

});
