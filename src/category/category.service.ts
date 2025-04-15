import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name.toLowerCase().trim(),
          description: createCategoryDto.description,
          parentId: createCategoryDto.parentId || null,
        },
      });
      return newCategory;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        `Falha ao criar categoria ou subcategoria ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll({
    hasChildren,
    limit,
    offset,
  }: {
    hasChildren?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const allCategory = await this.prisma.category.findMany({
        where: {
          ...(hasChildren === true && {
            children: { some: {} },
          }),
          ...(hasChildren === false && {
            children: { none: {} },
          }),
        },
        include: {
          children: true,
          // products: true,
        },
        take: limit,
        skip: offset,
      });

      return allCategory;
    } catch (error) {
      throw new HttpException(
        `Falha ao listar categorias ou subcategorias: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findFirst({
        where: {
          id: id,
        },
        include: {
          children: true,
        },
      });
      return category;
    } catch (error) {
      throw new HttpException(
        `Falha ao listar categoria ou subcategoria ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.update({
        where: {
          id: id,
        },
        data: {
          name: updateCategoryDto.name?.toLowerCase().trim(),
          description: updateCategoryDto.description,
          parentId: updateCategoryDto.parentId || null,
        },
      });
      return category;
    } catch (error) {
      throw new HttpException(
        `Falha ao atualizar categoria ou subcategoria ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.category.delete({
        where: {
          id: id,
        },
      });
      return {
        message: 'Categoria deletada com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        `Falha ao deletar categorias ou subcategorias ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
