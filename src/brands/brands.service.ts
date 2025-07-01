import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    if (!createBrandDto.name) {
      //max 21 caracteres
      throw new HttpException(
        'O nome da marca é obrigatório!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingName = await this.prisma.brands.findFirst({
      where: { name: createBrandDto.name.toLowerCase().trim() },
    });

    if (existingName?.name) {
      throw new HttpException(
        'O nome da marca já existe!',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      try {
        const brand = await this.prisma.brands.create({
          data: {
            name: createBrandDto.name.toLowerCase().trim(),
            description: createBrandDto.description,
          },
        });
        return brand;
      } catch (error) {
        throw new HttpException(
          `Falha ao criar marca  ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async uploadImageBrand(id: string, file: Express.Multer.File) {
    if (!id) {
      throw new HttpException('O id é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingBrand = await this.prisma.brands.findUnique({
      where: { id: id },
    });

    if (!existingBrand?.id) {
      throw new HttpException('Marca não encotrada', HttpStatus.BAD_REQUEST);
    }

    try {
      const image = await this.imagesService.postImage(id, file);
      return await this.prisma.brands.update({
        where: { id: existingBrand.id },
        data: {
          image: image,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erros ao fazer upload da imagem da categoria',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.brands.findMany();
    } catch (error) {
      throw new HttpException('Error a busrcar marcas', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new HttpException('O id é obrigatório!', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.brands.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException(
        `Falha ao buscar marca  ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    if (!id) {
      throw new HttpException('O id é obrigatório', HttpStatus.BAD_REQUEST);
    }
    if (!updateBrandDto.name) {
      throw new HttpException(
        'O nome da marca é obrigatório!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingBrand = await this.prisma.brands.findUnique({
      where: { id: id },
    });

    if (!existingBrand?.id) {
      throw new HttpException('Marca não encotrada', HttpStatus.BAD_REQUEST);
    }

    const existingName = await this.prisma.brands.findFirst({
      where: { name: updateBrandDto?.name.toLowerCase().trim() },
    });

    if (existingName?.name) {
      throw new HttpException(
        'O nome da marca já existe!',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      try {
        const brand = await this.prisma.brands.update({
          where: { id: existingBrand.id },
          data: {
            name: updateBrandDto.name?.toLowerCase().trim(),
            description: updateBrandDto.description,
          },
        });

        return brand;
      } catch (error) {
        throw new HttpException(
          `Falha ao criar marca  ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException('O id é obrigatório!', HttpStatus.BAD_REQUEST);
    }
    const existingBrand = await this.prisma.brands.findUnique({
      where: { id: id },
    });

    if (!existingBrand?.id) {
      throw new HttpException('Marca não encotrada', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.prisma.brands.delete({
        where: { id: id },
      });
      return {
        message: 'Deletado como sucesso!',
      };
    } catch (error) {
      throw new HttpException(
        `Falha ao deletar marca  ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
