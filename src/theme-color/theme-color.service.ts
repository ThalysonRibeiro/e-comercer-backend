import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateThemeColorDto } from './dto/create-theme-color.dto';
import { UpdateThemeColorDto } from './dto/update-theme-color.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ThemeFilters } from 'src/common/dto/all-theme-filter.dto';

@Injectable()
export class ThemeColorService {
  constructor(private prisma: PrismaService) {}

  async create(createThemeColorDto: CreateThemeColorDto) {
    if (!createThemeColorDto.siteContentId) {
      throw new HttpException(
        'SiteContentId é necessário',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: createThemeColorDto.siteContentId },
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
          siteContentId:
            existingSiteContent?.id || createThemeColorDto.siteContentId,
          nameTheme: createThemeColorDto.nameTheme,
          primaryColor: createThemeColorDto.primaryColor,
          secondaryColor: createThemeColorDto.secondaryColor,
          hover: createThemeColorDto.hover,
          star: createThemeColorDto.star,
          danger: createThemeColorDto.danger,
          success: createThemeColorDto.success,
          warning: createThemeColorDto.warning,
          shadowColor: createThemeColorDto.shadowColor,
          isDarkTheme: createThemeColorDto.isDarkTheme,
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
          bgFooterColor: createThemeColorDto.bgFooterColor,
        },
      });
      return themeColor;
    } catch (error) {
      throw new HttpException(
        'Erro ao tentar criar themeColors',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(themeFilters: ThemeFilters) {
    try {
      const { isDarkTheme } = themeFilters;

      let isDarkThemeFilter: { isDarkTheme?: boolean } = {};

      if (isDarkTheme !== undefined) {
        // Convertendo a query string para um booleano corretamente
        isDarkThemeFilter = { isDarkTheme: isDarkTheme === 'true' }; // ou 'false' para falso
      }

      return await this.prisma.themeColors.findMany({
        where: {
          ...isDarkThemeFilter,
          themeSelected: true,
        },
        orderBy: {
          isDarkTheme: 'desc',
        },
      });
      // return theme
    } catch (error) {
      throw new HttpException(
        'themeColors não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.themeColors.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException('theme não encontrado', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updateThemeColorDto: UpdateThemeColorDto) {
    if (!id) {
      throw new HttpException('Id é necessário', HttpStatus.BAD_REQUEST);
    }
    if (!updateThemeColorDto.siteContentId) {
      throw new HttpException(
        'SiteContentId é necessário',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: updateThemeColorDto.siteContentId },
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'SiteContent não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingThemeColor = await this.prisma.themeColors.findFirst({
      where: { id: id },
    });

    if (!existingThemeColor) {
      throw new HttpException('theme não encontrado!', HttpStatus.BAD_REQUEST);
    }

    try {
      const themeColor = await this.prisma.themeColors.update({
        where: { id: existingThemeColor.id },
        data: {
          siteContentId: updateThemeColorDto.siteContentId,
          nameTheme: updateThemeColorDto.nameTheme,
          primaryColor: updateThemeColorDto.primaryColor,
          secondaryColor: updateThemeColorDto.secondaryColor,
          hover: updateThemeColorDto.hover,
          star: updateThemeColorDto.star,
          danger: updateThemeColorDto.danger,
          success: updateThemeColorDto.success,
          warning: updateThemeColorDto.warning,
          shadowColor: updateThemeColorDto.shadowColor,
          isDarkTheme: updateThemeColorDto.isDarkTheme,
          price: updateThemeColorDto.price,
          title: updateThemeColorDto.title,
          textColor: updateThemeColorDto.textColor,
          textHover: updateThemeColorDto.textHover,
          oldPrice: updateThemeColorDto.oldPrice,
          borderColor: updateThemeColorDto.borderColor,
          textButton: updateThemeColorDto.textButton,
          bgCard: updateThemeColorDto.bgCard,
          themeColor: updateThemeColorDto.themeColor,
          themeSelected: updateThemeColorDto.themeSelected,
          bgFooterColor: updateThemeColorDto.bgFooterColor,
        },
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
      throw new HttpException('Id é necessário', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.themeColors.delete({
        where: { id: id },
      });
      return {
        message: 'Deletado com sucesso!',
      };
    } catch (error) {
      throw new HttpException('Error ao deletar', HttpStatus.BAD_REQUEST);
    }
  }
}
