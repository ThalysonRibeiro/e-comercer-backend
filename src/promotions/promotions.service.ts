import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';
import { AllPromotions } from 'src/common/dto/all-promotions.dto';

@Injectable()
export class PromotionsService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    if (!createPromotionDto.siteContentId) {
      throw new HttpException(
        'siteContentId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!createPromotionDto.startDate) {
      throw new HttpException(
        'É obrigatório ter um valor de data inicial',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: createPromotionDto.siteContentId },
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'siteContentId não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + createPromotionDto.startDate);
    try {
      const promotion = await this.prisma.promotions.create({
        data: {
          siteContentId: existingSiteContent?.id,
          title: createPromotionDto.title,
          slug: createPromotionDto.slug,
          description: createPromotionDto.description,
          discountType: createPromotionDto.discountType,
          discountValue: createPromotionDto.discountValue,
          couponCode: createPromotionDto.couponCode,
          isActive: createPromotionDto.isActive,
          endDate: dateFuture,
          buttonLink: createPromotionDto.buttonLink,
          buttonText: createPromotionDto.buttonText,
          position: createPromotionDto.position,
        },
      });
      return promotion;
    } catch (error) {
      console.log(error);

      throw new HttpException('Erro ao criar promoção', HttpStatus.BAD_REQUEST);
    }
  }

  async uploadBanner(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingPromoton = await this.prisma.promotions.findUnique({
      where: { id: id },
    });

    if (!existingPromoton) {
      throw new HttpException('Não existe Promoton', HttpStatus.BAD_REQUEST);
    }
    try {
      const image = await this.imagesService.postImage(id, file);
      return await this.prisma.promotions.update({
        where: { id: existingPromoton.id },
        data: {
          banner: image,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao fazer uploado da imagem',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadVideo(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingPromoton = await this.prisma.promotions.findUnique({
      where: { id: id },
    });

    if (!existingPromoton) {
      throw new HttpException(
        'Não existe ProexistingPromoton',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const video = await this.imagesService.postVideo(id, file);
      return await this.prisma.promotions.update({
        where: { id: existingPromoton.id },
        data: {
          video: video,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao fazer uploado do video',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(allPromotions: AllPromotions) {
    const { limit, offset, active, position, endDate } = allPromotions;

    let checkActive: boolean | undefined;
    switch (active?.toLowerCase()) {
      case 'true':
        checkActive = true;
        break;
      case 'false':
        checkActive = false;
        break;
      default:
        checkActive = undefined;
        break;
    }

    // Data atual
    const currentDate = new Date();
    // Filtro para endDate - se endDate for "true", filtra produtos expirados
    let endDateQueryFilter = {};

    if (endDate === 'true' || endDate === 'true') {
      // Se endDate for "true", mostrar apenas produtos não expirados
      endDateQueryFilter = {
        OR: [{ endDate: { gt: currentDate } }, { endDate: null }],
      };
    } else if (endDate) {
      // Se endDate for uma data específica, filtra por aquele dia
      const data = new Date(endDate);
      const inicioDoDia = new Date(data.setHours(0, 0, 0, 0));
      const fimDoDia = new Date(data.setHours(23, 59, 59, 999));

      endDateQueryFilter = {
        endDate: {
          gte: inicioDoDia,
          lte: fimDoDia,
        },
      };
    }

    try {
      return await this.prisma.promotions.findMany({
        where: {
          ...(checkActive !== undefined && { isActive: checkActive }),
          ...(position && { position: position.toLowerCase() }),
          ...endDateQueryFilter,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new HttpException('Erro ao listar', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    return await this.prisma.promotions.findUnique({
      where: { id: id },
    });
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    if (!updatePromotionDto.startDate) {
      throw new HttpException(
        'É obrigatório ter um valor de data inicial',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingPromotions = await this.prisma.promotions.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingPromotions) {
      throw new HttpException(
        'promoção não encontrada não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + updatePromotionDto.startDate);
    try {
      const promotion = await this.prisma.promotions.update({
        where: { id: existingPromotions.id },
        data: {
          title: updatePromotionDto.title,
          slug:
            updatePromotionDto.slug === existingPromotions.slug
              ? existingPromotions.slug
              : updatePromotionDto.slug,
          description: updatePromotionDto.description,
          discountType: updatePromotionDto.discountType,
          discountValue: updatePromotionDto.discountValue,
          couponCode: updatePromotionDto.couponCode,
          isActive: updatePromotionDto.isActive,
          endDate: dateFuture,
          buttonLink: updatePromotionDto.buttonLink,
          buttonText: updatePromotionDto.buttonText,
          position: updatePromotionDto.position,
        },
      });
      return promotion;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        'Erro ao editar promoção',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException('O id é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.promotions.delete({
        where: { id: id },
      });
      return {
        message: 'Deletado com sucesso!',
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao deletar promoção',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
