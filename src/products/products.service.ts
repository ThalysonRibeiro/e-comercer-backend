import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    if (!createProductDto) {
      throw new Error('Product data is required');
    }

    if (!createProductDto.title) {
      throw new Error('Product title is required');
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          title: createProductDto.title,
          price: createProductDto.price,
          old_price: createProductDto.old_price,
          assessment: createProductDto.assessment,
          promotion_time: createProductDto.promotion_time,
          description: createProductDto.description,
          products_sold: createProductDto.products_sold,
          endDate: createProductDto.endDate,
          bigsale: createProductDto.bigsale,
          sku: `SKU-PRD-${crypto.randomInt(createProductDto.stock)}`,
          stock: createProductDto.stock,
          category: createProductDto.category.toLowerCase(),
          brand: createProductDto.brand.toLowerCase(),
          tags: createProductDto.tags.map(tag => tag.toLowerCase()),
          options: createProductDto.options && createProductDto.options.length > 0
            ? {
              create: createProductDto.options.flatMap(optionInput =>
                optionInput.create
                  ? optionInput.create.map(option => ({
                    color: option.color || [],
                    size: option.size || []
                  }))
                  : []
              ).filter(option =>
                option.color.length > 0 || option.size.length > 0
              )
            }
            : undefined,
          images: createProductDto.images && createProductDto.images.length > 0
            ? {
              create: createProductDto.images.map(img => ({
                image: img.image
              }))
            }
            : undefined
        },
        include: {
          options: true,
          images: true
        }
      });

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      category,
      price,
      '-price': maxPrice,
      brand,
      tags,
      bigsale,
      assessment,
    } = paginationDto;

    // Prepara o filtro de preço
    let priceFilter: { price?: { gte?: number; lte?: number } } = {};  // Definindo a estrutura
    if (price) {
      priceFilter = { ...priceFilter, price: { gte: parseFloat(price.toString()) } };
    }
    if (maxPrice) {
      priceFilter = { ...priceFilter, price: { ...priceFilter.price, lte: parseFloat(maxPrice.toString()) } };
    }

    // Filtro para categoria
    let categoryFilter: { category?: string } = {};  // Definindo a estrutura
    if (category) {
      categoryFilter = { category: category };
    }

    // Filtro para marca
    let brandFilter: { brand?: string } = {};  // Definindo a estrutura
    if (brand) {
      brandFilter = { brand: brand };
    }

    // Filtro de tags (verifica se é uma string e converte para array)
    let tagsFilter: { tags?: { hasSome: string[] } } = {};
    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
      tagsFilter = { tags: { hasSome: tagArray } };
    }

    // Função para processar o valor de bigsale como booleano
    let bigsaleFilter: { bigsale?: boolean } = {};

    if (bigsale !== undefined) {
      // Convertendo a query string para um booleano corretamente
      bigsaleFilter = { bigsale: bigsale === 'true' }; // ou 'false' para falso
    }

    // Filtro para avaliação
    let assessmentFilter: { assessment?: { gte: number } } = {};  // Definindo a estrutura
    if (assessment) {
      assessmentFilter = { assessment: { gte: parseInt(assessment.toString()) } };
    }

    // Fazendo a consulta no banco com todos os filtros
    const products = await this.prisma.product.findMany({
      where: {
        ...categoryFilter,
        ...priceFilter,
        ...brandFilter,
        ...tagsFilter,
        ...bigsaleFilter,
        ...assessmentFilter,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc', // Ordena pela data de criação (ou outra opção que preferir)
      },
      include: {
        options: true,
        images: true,
      }
    });

    return products;
  }


  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: id
      }
    })
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: {
        id: id
      },
      data: {
        title: updateProductDto.title,
        price: updateProductDto.price,
        old_price: updateProductDto.old_price,
        assessment: updateProductDto.assessment,
        promotion_time: updateProductDto.promotion_time,
        description: updateProductDto.description,
        products_sold: updateProductDto.products_sold,
        endDate: updateProductDto.endDate,
        bigsale: updateProductDto.bigsale,
        stock: updateProductDto.stock,
        category: updateProductDto.category?.toLowerCase(),
        brand: updateProductDto.brand?.toLowerCase(),
        tags: updateProductDto.tags?.map(tag => tag.toLowerCase()),
        options: updateProductDto.options && updateProductDto.options.length > 0
          ? {
            create: updateProductDto.options.flatMap(optionInput =>
              optionInput.create
                ? optionInput.create.map(option => ({
                  color: option.color || [],
                  size: option.size || []
                }))
                : []
            ).filter(option =>
              option.color.length > 0 || option.size.length > 0
            )
          }
          : undefined,
        images: updateProductDto.images && updateProductDto.images.length > 0
          ? {
            create: updateProductDto.images.map(img => ({
              image: img.image
            }))
          }
          : undefined
      },
      select: {
        options: true,
        images: true
      }
    })
    return product;
  }

  async remove(id: string) {
    await this.prisma.product.delete({
      where: {
        id: id
      }
    })
    return `This action removes a #${id} product`;
  }
}
