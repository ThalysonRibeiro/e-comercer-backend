import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInstitutionalLinkDto } from './dto/create-institutional-link.dto';
import { UpdateInstitutionalLinkDto } from './dto/update-institutional-link.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InstitutionalLinkService {
  constructor(private prisma: PrismaService) { }

  async create(createInstitutionalLinkDto: CreateInstitutionalLinkDto) {
    if (!createInstitutionalLinkDto.siteContentId) {
      throw new HttpException(
        'siteContentId é obrigatório!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: createInstitutionalLinkDto.siteContentId }
    });
    if (!existingSiteContent) {
      throw new HttpException(
        'siteContentI não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.prisma.institutionalLink.create({
        data: {
          siteContentId: existingSiteContent.id,
          name: createInstitutionalLinkDto.name,
          link: createInstitutionalLinkDto.link
        }
      })
    } catch (error) {
      throw new HttpException(
        'erro ao criar InstitutionalLink!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.institutionalLink.findMany();
    } catch (error) {
      throw new HttpException(
        'erro ao listar os InstitutionalLink!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new HttpException(
        'o id é obrigatório!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.prisma.institutionalLink.findUnique({
        where: { id }
      });
    } catch (error) {
      throw new HttpException(
        'erro ao buscar InstitutionalLink!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateInstitutionalLinkDto: UpdateInstitutionalLinkDto) {
    if (!id) {
      throw new HttpException(
        'Id é obrigatório!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingInstitutionalLink = await this.prisma.institutionalLink.findFirst({
      where: { id }
    });

    if (!existingInstitutionalLink) {
      throw new HttpException(
        'InstitutionalLink não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.prisma.institutionalLink.update({
        where: { id: existingInstitutionalLink.id },
        data: {
          name: updateInstitutionalLinkDto.name,
          link: updateInstitutionalLinkDto.link
        }
      })
    } catch (error) {
      throw new HttpException(
        'erro ao atualizar InstitutionalLink!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException(
        'o id é obrigatório!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.prisma.institutionalLink.delete({
        where: { id }
      });
      return {
        message: "Item deletado com sucesso!"
      }
    } catch (error) {
      throw new HttpException(
        'erro ao deletar InstitutionalLink!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
