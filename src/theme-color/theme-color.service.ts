import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateThemeColorDto } from './dto/create-theme-color.dto';
import { UpdateThemeColorDto } from './dto/update-theme-color.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ThemeColorService {
  constructor(private prisma: PrismaService) { }

  async create(createThemeColorDto: CreateThemeColorDto) {

    if (!createThemeColorDto.siteContentId) {
      throw new HttpException(
        'SiteContentId é necessário',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: createThemeColorDto.siteContentId }
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'SiteContent não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const themeColor = await this.prisma.themeColors.create({
        data: {
          siteContentId: existingSiteContent?.id || createThemeColorDto.siteContentId,
          primaryColor: createThemeColorDto.primaryColor,
          secondaryColor: createThemeColorDto.secondaryColor,
          hover: createThemeColorDto.hover,
          star: createThemeColorDto.star,
          danger: createThemeColorDto.danger,
          price: createThemeColorDto.price,
          title: createThemeColorDto.title,
          textColor: createThemeColorDto.textColor,
          textHover: createThemeColorDto.textHover,
          oldPrice: createThemeColorDto.oldPrice,
          borderColor: createThemeColorDto.borderColor,
          textButton: createThemeColorDto.textButton,
          bgCard: createThemeColorDto.bgCard,
          themeColor: createThemeColorDto.themeColor,
          themeSelected: createThemeColorDto.themeSelected,
        }
      });
      return themeColor;
    } catch (error) {
      throw new HttpException(
        'Erro ao tentar criar themeColors',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.themeColors.findFirst({
        where: { themeSelected: true }
      });
    } catch (error) {
      throw new HttpException(
        'themeColors não encontrado',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.themeColors.findUnique({
        where: { id: id }
      });
    } catch (error) {
      throw new HttpException(
        'theme não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateThemeColorDto: UpdateThemeColorDto) {
    if (!id) {
      throw new HttpException(
        'Id é necessário',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!updateThemeColorDto.siteContentId) {
      throw new HttpException(
        'SiteContentId é necessário',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: updateThemeColorDto.siteContentId }
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'SiteContent não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingThemeColor = await this.prisma.themeColors.findUnique({
      where: { id: id }
    });

    if (!existingThemeColor) {
      throw new HttpException(
        'theme não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const themeColor = await this.prisma.themeColors.update({
        where: { id: existingThemeColor.id },
        data: {
          siteContentId: updateThemeColorDto.siteContentId,
          primaryColor: updateThemeColorDto.primaryColor,
          secondaryColor: updateThemeColorDto.secondaryColor,
          hover: updateThemeColorDto.hover,
          star: updateThemeColorDto.star,
          danger: updateThemeColorDto.danger,
          price: updateThemeColorDto.price,
          title: updateThemeColorDto.title,
          textColor: updateThemeColorDto.textColor,
          textHover: updateThemeColorDto.textHover,
          oldPrice: updateThemeColorDto.oldPrice,
          borderColor: updateThemeColorDto.borderColor,
          textButton: updateThemeColorDto.textButton,
          bgCard: updateThemeColorDto.bgCard,
          themeColor: updateThemeColorDto.themeColor,
          themeSelected: updateThemeColorDto.themeSelected
        }
      });
      return themeColor;
    } catch (error) {
      throw new HttpException(
        'Erro ao tentar criar themeColors',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException(
        'Id é necessário',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.prisma.themeColors.delete({
        where: { id: id }
      });
      return {
        message: "Deletado com sucesso!"
      }
    } catch (error) {
      throw new HttpException(
        'Error ao deletar',
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
