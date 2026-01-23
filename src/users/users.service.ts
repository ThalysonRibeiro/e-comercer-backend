import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, AccountStatus, AccountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './dto/create-user.dto';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
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

  async findByCpfOrCnpj(document: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { document },
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
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
        addresses: true,
        reviews: true,
        wishlist: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        cart: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async userById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        type: true,
        name: true,
        document: true,
        gender: true,
        dateOfBirth: true,
        email: true,
        phone: true,
        resetPasswordToken: true,
        resetPasswordExpires: true,
        emailVerified: true,
        emailVerificationToken: true,
        googleId: true,
        avatar: true,
        acceptTerms: true,
        acceptOffers: true,
        documentType: true,
        createdAt: true,
        updatedAt: true,
        order: {
          include: {
            orderItems: true,
          },
        },
        addresses: true,
        reviews: true,
        wishlist: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
        cart: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async allUsers() {
    try {
      return await this.prisma.user.findMany({
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          addresses: true,
          reviews: true,
          cart: true,
          order: true,
          wishlist: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao listar usuários',
        HttpStatus.BAD_REQUEST,
      );
    }
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
      document: string;
      gender: string;
      dateOfBirth: Date | null;
      phone: string;
      password: string;
      emailVerified: Date;
      resetPasswordToken: string | null;
      resetPasswordExpires: Date | null;
      acceptOffers: boolean | null;
      acceptTerms: boolean | null;
      documentType: string | null;
    }>,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateUserProfile(id: string, updateUserDto: UpdateUserDto) {
    if (!id) {
      throw new HttpException('O id é obrigatório', HttpStatus.NOT_FOUND);
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { id: id },
    });

    if (!existingUser) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    try {

      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: updateUserDto.name,
          email: updateUserDto.email?.trim(),
          status: updateUserDto.status,
          type: updateUserDto.type,
          document: updateUserDto.document?.trim(),
          gender: updateUserDto.gender?.trim(),
          dateOfBirth: updateUserDto.dateOfBirth,
          phone: updateUserDto.phone,
          acceptOffers: updateUserDto.acceptOffers,
          acceptTerms: updateUserDto.acceptTerms,
          documentType: updateUserDto.documentType,
        }
      });

      return {
        message: 'Perfil atualizado com sucesso'
      }
    } catch (error) {
      throw new HttpException('Erro ao atualizar usuário', HttpStatus.NOT_FOUND);
    }

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

  async deleteUser(id: string) {
    if (!id) {
      throw new HttpException('O id é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new HttpException(
        'falha ao deletaer usuário',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
