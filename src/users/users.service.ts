import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, AccountStatus, AccountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './dto/create-user.dto';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private configService: ConfigService,) {
    // cloudinary.config({
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //   api_key: process.env.CLOUDINARY_API_KEY,
    //   api_secret: process.env.CLOUDINARY_API_SECRET,
    // });
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }



  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailOrPhone(login: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { phone: login }],
      },
    });
  }

  async findByCPF(cpf: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { cpf },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }

    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      googleId: string;
      avatar: string;
      status: AccountStatus;
      type: AccountType;
      cpf: string;
      genero: string;
      dateOfBirth: string;
      phone: string;
      password: string;
      emailVerified: Date;
      resetPasswordToken: string | null;
      resetPasswordExpires: Date | null;
    }>,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async completeProfile(
    id: string,
    data: {
      name: string;
      cpf: string;
      genero: string;
      dateOfBirth: string;
      phone: string;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async uploadAvatarImage(req, file: Express.Multer.File) {
    try {
      const fileExtension = path
        .extname(file.originalname)
        .toLowerCase()
        .substring(1);

      const fileName = `${req.user.id}.${fileExtension}`;

      const fileLocale = path.resolve(process.cwd(), 'files', fileName);

      await fs.writeFile(fileLocale, file.buffer);

      const user = await this.prisma.user.findFirst({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new HttpException(
          'Falha ao atualizar o avatar do usuario',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedAvatarUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatar: fileName },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
        },
      });

      return updatedAvatarUser;
    } catch (error) {
      throw new HttpException(
        'Falha ao atualizar o avatar do usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadAvatarCloudnary(req, file: Express.Multer.File) {
    try {
      // Converte o buffer do arquivo para base64 para upload no Cloudinary
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      // Faz o upload para o Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'avatars',
        public_id: `user_${req.user.id}`,
        overwrite: true,
        resource_type: 'image',
      });

      const user = await this.prisma.user.findFirst({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new HttpException(
          'Falha ao atualizar o avatar do usuário',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Atualiza o usuário com a URL do Cloudinary em vez do nome do arquivo
      const updatedAvatarUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatar: result.secure_url },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
        },
      });

      return updatedAvatarUser;
    } catch (error) {
      throw new HttpException(
        'Falha ao atualizar o avatar do usuário',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
