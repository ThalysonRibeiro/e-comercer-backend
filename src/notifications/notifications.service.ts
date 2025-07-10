import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    if (!createNotificationDto.userId) {
      throw new Error('userId é obrigatório!');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });

    if (!existingUser) {
      throw new HttpException(
        'Usuário não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.prisma.notifications.create({
        data: {
          userId: existingUser.id,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'erro ao criar notificação!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.notifications.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'erro ao listar os InstitutionalLink!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new HttpException('o id é obrigatório!', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.notifications.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new HttpException(
        'erro ao buscar notificação!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    if (!id) {
      throw new HttpException('o id é obrigatório!', HttpStatus.BAD_REQUEST);
    }
    const existingNotification = await this.findOne(id);
    if (!existingNotification) {
      throw new HttpException(
        'Notificação não encontrada!',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.prisma.notifications.update({
        where: { id: existingNotification.id },
        data: {
          title: updateNotificationDto.title,
          message: updateNotificationDto.message,
          is_read: updateNotificationDto.is_read,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'erro atualizar notificação!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async markAsRead(id: string) {
    if (!id) {
      throw new HttpException('o id é obrigatório!', HttpStatus.BAD_REQUEST);
    }
    const existingNotification = await this.findOne(id);
    if (!existingNotification) {
      throw new HttpException(
        'Notificação não encontrada!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.prisma.notifications.update({
        where: { id: existingNotification.id },
        data: {
          is_read: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'erro marcar como lida a notificação!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException('o id é obrigatório!', HttpStatus.BAD_REQUEST);
    }
    const existingNotification = await this.findOne(id);
    if (!existingNotification) {
      throw new HttpException(
        'Notificação não encontrada!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.prisma.notifications.delete({
        where: { id },
      });
      return {
        message: 'Item deletado com sucesso!',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'erro ao deletar notificação!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
