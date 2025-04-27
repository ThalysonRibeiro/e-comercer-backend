import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePromotionHeroDto } from './dto/create-promotion-hero.dto';
import { UpdatePromotionHeroDto } from './dto/update-promotion-hero.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';
import { AllPromotionHero } from 'src/common/dto/all-promotions-hero.dto';

@Injectable()
export class PromotionHeroService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
  ) { }

  async create(createPromotionHeroDto: CreatePromotionHeroDto) {
    if (!createPromotionHeroDto.siteContentId) {
      throw new HttpException(
        'siteContentId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!createPromotionHeroDto.startDate) {
      throw new HttpException(
        'É obrigatório ter um valor de data inicial',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: createPromotionHeroDto.siteContentId },
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'siteContentId não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + createPromotionHeroDto.startDate);

    try {
      const promotionHero = await this.prisma.promotionHero.create({
        data: {
          siteContentId: existingSiteContent.id,
          promotionLink: createPromotionHeroDto.promotionLink,
          position: createPromotionHeroDto.position,
          isActive: createPromotionHeroDto.isActive,
          order: createPromotionHeroDto.order,
          startDate: createPromotionHeroDto.startDate,
          endDate: dateFuture,
        },
      });
      return promotionHero;
    } catch (error) {
      throw new HttpException(
        'Erro ao criar promoção do hero',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingPromoton = await this.prisma.promotionHero.findUnique({
      where: { id: id },
    });

    if (!existingPromoton) {
      throw new HttpException('Não existe Promoção', HttpStatus.BAD_REQUEST);
    }
    try {
      const image = await this.imagesService.postImage(id, file);
      return await this.prisma.promotionHero.update({
        where: { id: existingPromoton.id },
        data: {
          image: image,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao fazer uploado da imagem',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(allPromotionHero: AllPromotionHero) {
    const { limit, offset, active, position, order } = allPromotionHero;

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

    try {
      return await this.prisma.promotionHero.findMany({
        where: {
          ...(checkActive !== undefined && { isActive: checkActive }),
          ...(position && { position: position.toLowerCase() }),
          ...(order && { order }),
        },
        take: limit,
        skip: offset,
        orderBy: {
          order: 'asc',
        },
      });
    } catch (error) {
      throw new HttpException('Erro ao listar', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.promotionHero.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException('Erro ao lista item', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updatePromotionHeroDto: UpdatePromotionHeroDto) {
    if (!updatePromotionHeroDto.siteContentId) {
      throw new HttpException(
        'siteContentId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingPromotionHero = await this.prisma.promotionHero.findUnique({
      where: { id: id },
    });
    if (!existingPromotionHero) {
      throw new HttpException(
        'Promoção não encontrada',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!updatePromotionHeroDto.startDate) {
      throw new HttpException(
        'É obrigatório ter um valor de data inicial',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingSiteContent = await this.prisma.siteContent.findUnique({
      where: { id: updatePromotionHeroDto.siteContentId },
    });

    if (!existingSiteContent) {
      throw new HttpException(
        'siteContentId não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + updatePromotionHeroDto.startDate);

    try {
      const promotionHero = await this.prisma.promotionHero.update({
        where: { id: existingPromotionHero.id },
        data: {
          siteContentId: existingSiteContent.id,
          promotionLink: updatePromotionHeroDto.promotionLink,
          position: updatePromotionHeroDto.position,
          isActive: updatePromotionHeroDto.isActive,
          order: updatePromotionHeroDto.order,
          startDate: updatePromotionHeroDto.startDate,
          endDate: dateFuture,
        },
      });
      return promotionHero;
    } catch (error) {
      throw new HttpException(
        'Erro ao criar promoção do hero',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException('id é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.promotionHero.delete({
        where: { id: id },
      });
      return {
        message: 'Item deletado com sucesso!',
      };
    } catch (error) {
      throw new HttpException(
        'erro ao tentar deletar o item',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
