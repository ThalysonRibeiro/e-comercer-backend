import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocialMediaService {
  constructor(private prisma: PrismaService) {}

  async create(createSocialMediaDto: CreateSocialMediaDto) {
    if (!createSocialMediaDto.siteContentId) {
      throw new HttpException(
        'siteContentId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: createSocialMediaDto.siteContentId },
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'siteContentId não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const socialMedia = await this.prisma.socialMedia.create({
        data: {
          siteContentId: existingSiteContent.id,
          name: createSocialMediaDto.name.toLowerCase(),
          link: createSocialMediaDto.link,
        },
      });
      return socialMedia;
    } catch (error) {
      throw new HttpException(
        'Erro ao crair social media',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.socialMedia.findMany();
    } catch (error) {
      throw new HttpException(
        'Erro ao listar social media',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new HttpException('Id é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.socialMedia.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao listar social media',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async update(id: string, updateSocialMediaDto: UpdateSocialMediaDto) {
    if (!id) {
      throw new HttpException('Id é obrigatório', HttpStatus.BAD_REQUEST);
    }
    const existingSocialMediat = await this.prisma.socialMedia.findUnique({
      where: { id: id },
    });

    if (!existingSocialMediat) {
      throw new HttpException(
        'siteContentId não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const socialMedia = await this.prisma.socialMedia.update({
        where: { id: existingSocialMediat?.id },
        data: {
          name: updateSocialMediaDto.name?.toLowerCase(),
          link: updateSocialMediaDto.link,
        },
      });
      return socialMedia;
    } catch (error) {
      throw new HttpException(
        'Erro ao crair social media',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException('Id é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.socialMedia.delete({
        where: { id: id },
      });
      return {
        message: 'Social media deltado com sucesso!',
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao deletar social media',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
