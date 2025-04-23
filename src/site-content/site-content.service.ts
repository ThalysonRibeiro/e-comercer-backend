import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSiteContentDto } from './dto/create-site-content.dto';
import { UpdateSiteContentDto } from './dto/update-site-content.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';

@Injectable()
export class SiteContentService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
  ) { }
  async create(createSiteContentDto: CreateSiteContentDto) {
    if (!createSiteContentDto.image_logo) {
      throw new HttpException(
        'image_logo é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const siteLayout = await this.prisma.siteContent.create({
        data: {
          banner: createSiteContentDto.banner,
          video: createSiteContentDto.video,
          bg_video: createSiteContentDto.bg_video,
          image_logo: createSiteContentDto.image_logo,
          title: createSiteContentDto.title,
          metaTitle: createSiteContentDto.metaTitle,
          metaDescription: createSiteContentDto.metaDescription,
          keywords: createSiteContentDto.keywords,
          favicon: createSiteContentDto.favicon,
          service: createSiteContentDto.service,
          footerText: createSiteContentDto.footerText,
          isActive: createSiteContentDto.isActive,
        },
      });
      return siteLayout;
    } catch (error) {
      throw new HttpException(
        'Erro ao criar o layout do site',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadBanner(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingSiteLayout = await this.prisma.siteContent.findUnique({
      where: { id: id },
    });

    if (!existingSiteLayout) {
      throw new HttpException('Não existe SiteLayout', HttpStatus.BAD_REQUEST);
    }
    try {
      const image = await this.imagesService.postImage(id, file);
      return await this.prisma.siteContent.update({
        where: { id: existingSiteLayout.id },
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

    const existingSiteLayout = await this.prisma.siteContent.findUnique({
      where: { id: id },
    });

    if (!existingSiteLayout) {
      throw new HttpException('Não existe SiteLayout', HttpStatus.BAD_REQUEST);
    }
    try {
      const video = await this.imagesService.postVideo(id, file);
      return await this.prisma.siteContent.update({
        where: { id: existingSiteLayout.id },
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

  async uploadBGVideo(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingSiteLayout = await this.prisma.siteContent.findUnique({
      where: { id: id },
    });

    if (!existingSiteLayout) {
      throw new HttpException('Não existe SiteLayout', HttpStatus.BAD_REQUEST);
    }
    try {
      const bgVideo = await this.imagesService.postVideo(id, file);
      return await this.prisma.siteContent.update({
        where: { id: existingSiteLayout.id },
        data: {
          bg_video: bgVideo,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao fazer uploado do video',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadLogo(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingSiteLayout = await this.prisma.siteContent.findUnique({
      where: { id: id },
    });

    if (!existingSiteLayout) {
      throw new HttpException('Não existe SiteLayout', HttpStatus.BAD_REQUEST);
    }
    try {
      const logo = await this.imagesService.postImage(id, file);
      return await this.prisma.siteContent.update({
        where: { id: existingSiteLayout.id },
        data: {
          image_logo: logo,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao fazer uploado da imagem',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadImageOpenGrap(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingSiteLayout = await this.prisma.siteContent.findUnique({
      where: { id: id },
    });

    if (!existingSiteLayout) {
      throw new HttpException('Não existe SiteLayout', HttpStatus.BAD_REQUEST);
    }
    try {
      const image_openGrap = await this.imagesService.postImage(id, file);
      return await this.prisma.siteContent.update({
        where: { id: existingSiteLayout.id },
        data: {
          image_openGraph: image_openGrap,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao fazer uploado da imagem',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadFavicon(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O ID é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingSiteLayout = await this.prisma.siteContent.findUnique({
      where: { id: id },
    });

    if (!existingSiteLayout) {
      throw new HttpException('Não existe SiteLayout', HttpStatus.BAD_REQUEST);
    }
    try {
      const favicon = await this.imagesService.postImage(id, file);
      return await this.prisma.siteContent.update({
        where: { id: existingSiteLayout.id },
        data: {
          favicon: favicon,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao fazer uploado da imagem',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.siteContent.findMany({
        where: {
          isActive: true
        },
        include: {
          promotions: true,
          promotionHero: true,
          socialMedia: true,
          contactInfo: true,
          themeColors: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao listar todos os layout do site',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.siteContent.findUnique({
        where: { id: id },
        include: {
          promotions: true,
          promotionHero: true,
          socialMedia: true,
          contactInfo: true,
          themeColors: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao listar o layout do site',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateSiteContentDto: UpdateSiteContentDto) {
    if (!id) {
      throw new HttpException('o ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    if (!updateSiteContentDto.image_logo) {
      throw new HttpException(
        'image_logo é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const siteLayout = await this.prisma.siteContent.update({
        where: { id: id },
        data: {
          banner: updateSiteContentDto.banner,
          video: updateSiteContentDto.video,
          bg_video: updateSiteContentDto.bg_video,
          image_logo: updateSiteContentDto.image_logo,
          title: updateSiteContentDto.title,
          metaTitle: updateSiteContentDto.metaTitle,
          metaDescription: updateSiteContentDto.metaDescription,
          keywords: updateSiteContentDto.keywords,
          favicon: updateSiteContentDto.favicon,
          service: updateSiteContentDto.service,
          footerText: updateSiteContentDto.footerText,
          isActive: updateSiteContentDto.isActive,
        },
        include: {
          promotions: true,
          promotionHero: true,
          socialMedia: true,
          contactInfo: true,
        },
      });
      return siteLayout;
    } catch (error) {
      throw new HttpException(
        'Erro ao criar o layout do site',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.siteContent.delete({
        where: { id: id },
      });
      return {
        message: 'Layout do site deletado com sucesso!',
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao deletar o layout do site',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
