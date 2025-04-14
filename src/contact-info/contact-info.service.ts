import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) {}

  async create(createContactInfoDto: CreateContactInfoDto) {
    if (!createContactInfoDto.siteContentId) {
      throw new HttpException(
        'siteContentId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: createContactInfoDto.siteContentId },
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'siteContent não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const contactInfo = await this.prisma.contactInfo.create({
        data: {
          siteContentId: existingSiteContent.id,
          type: createContactInfoDto.type,
          value: createContactInfoDto.value,
          label: createContactInfoDto.label,
        },
      });
      return contactInfo;
    } catch (error) {
      throw new HttpException(
        'Erro ao criar contato info',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.contactInfo.findMany();
    } catch (error) {
      throw new HttpException(
        'Erro ao listar contatos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new HttpException('ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.contactInfo.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException('Erro ao listar contato', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updateContactInfoDto: UpdateContactInfoDto) {
    if (!id) {
      throw new HttpException('ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    if (!updateContactInfoDto.siteContentId) {
      throw new HttpException(
        'siteContentId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingContactInfo = await this.prisma.contactInfo.findUnique({
      where: { id: id },
    });

    if (!existingContactInfo) {
      throw new HttpException('contato não encontrado', HttpStatus.BAD_REQUEST);
    }
    try {
      const contactInfo = await this.prisma.contactInfo.update({
        where: { id: existingContactInfo.id },
        data: {
          type: updateContactInfoDto.type,
          value: updateContactInfoDto.value,
          label: updateContactInfoDto.label,
        },
      });
      return contactInfo;
    } catch (error) {
      throw new HttpException(
        'Erro ao editar contato info',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException('ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.contactInfo.delete({
        where: { id: id },
      });
      return {
        message: 'Item deletado com sucesso!',
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao deletar contato',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
