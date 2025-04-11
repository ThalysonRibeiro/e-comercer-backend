import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // async createProductWithImages(
  //   createProductDto: CreateProductDto,
  //   files?: Array<Express.Multer.File>,
  // ) {
  //   try {
  //     // Remova as imagens do DTO para não incluir na criação inicial
  //     const { images, ...productData } = createProductDto;

  //     // Cria o produto sem as imagens
  //     const product = await this.prisma.product.create({
  //       data: {
  //         ...productData,
  //         sku: `SKU-PRD-${crypto.randomInt(10000)}`,
  //         category: productData.category.toLowerCase(),
  //         brand: productData.brand.toLowerCase(),
  //         tags: productData.tags.map((tag) => tag.toLowerCase()),
  //         options:
  //           productData.options && productData.options.length > 0
  //             ? {
  //               create: productData.options
  //                 .flatMap((optionInput) =>
  //                   optionInput.create
  //                     ? optionInput.create.map((option) => ({
  //                       color: option.color || [],
  //                       size: option.size || [],
  //                     }))
  //                     : [],
  //                 )
  //                 .filter(
  //                   (option) =>
  //                     option.color.length > 0 || option.size.length > 0,
  //                 ),
  //             }
  //             : undefined,
  //       },
  //       include: {
  //         options: true,
  //       },
  //     });

  //     // Se houver arquivos, realiza o upload das imagens
  //     if (files && files.length > 0) {
  //       const savedImages: { id: string; image: string }[] = [];

  //       for (const file of files) {
  //         const fileExtension = path
  //           .extname(file.originalname)
  //           .toLowerCase()
  //           .substring(1);
  //         const fileName = `${product.id}.${fileExtension}`;

  //         const fileDirectory = path.resolve(process.cwd(), 'files');
  //         const fileLocale = path.join(fileDirectory, fileName);

  //         // Salva o arquivo
  //         await fs.writeFile(fileLocale, file.buffer);

  //         // Cria registro da imagem no banco de dados
  //         const urlImage = await this.prisma.image.create({
  //           data: {
  //             productId: product.id,
  //             image: `/files/${fileName}`,
  //           },
  //           select: {
  //             id: true,
  //             image: true,
  //           },
  //         });

  //         savedImages.push(urlImage);
  //       }

  //       // Busca o produto atualizado com as imagens
  //       const productWithImages = await this.prisma.product.findUnique({
  //         where: { id: product.id },
  //         include: {
  //           images: true,
  //           options: true,
  //         },
  //       });

  //       return productWithImages;
  //     }

  //     return product;
  //   } catch (error) {
  //     console.error('Erro ao criar produto com imagens:', error);
  //     throw new HttpException(
  //       `Falha ao criar produto: ${error.message}`,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  async create(createProductDto: CreateProductDto) {
    if (!createProductDto) {
      throw new Error('Product data is required');
    }

    if (!createProductDto.title) {
      throw new Error('Product title is required');
    }

    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + createProductDto.promotion_time);

    try {
      const product = await this.prisma.product.create({
        data: {
          title: createProductDto.title,
          price: createProductDto.price,
          old_price: createProductDto.old_price,
          rating: createProductDto.rating,
          promotion_time: createProductDto.promotion_time,
          description: createProductDto.description,
          products_sold: createProductDto.products_sold,
          endDate: dateFuture,
          bigsale: createProductDto.bigsale,
          sku: `SKU-PRD-${crypto.randomInt(10000)}`,
          stock: createProductDto.stock,
          category: createProductDto.category.toLowerCase(),
          categoryId: createProductDto.categoryId,
          brand: createProductDto.brand.toLowerCase(),
          tags: createProductDto.tags.map((tag) => tag.toLowerCase()),
          weight: createProductDto.weight,
          width: createProductDto.width,
          height: createProductDto.height,
          length: createProductDto.length,
          isActive: createProductDto.isActive,
          featured: createProductDto.featured,
          color: createProductDto.color || [],
          size: createProductDto.size || [],
        },
        include: {
          images: true,
        },
      });

      return product;
    } catch (error) {
      throw new Error(`Falha ao criar produto: ${error.message}`);
    }
  }

  async uploadImageslocal(
    productId: string,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const savedImages: { id: string; image: string }[] = [];

      if (!files || files.length === 0) {
        throw new Error('Nenhum arquivo foi enviado.');
      }

      // Verificação de tipo para productId
      if (typeof productId !== 'string') {
        throw new Error('productId deve ser uma string');
      }

      // Garantindo que fileName seja uma string
      for (const file of files) {
        const fileExtension = path
          .extname(file.originalname)
          .toLowerCase()
          .substring(1);
        const fileName = `${productId}.${fileExtension}`;

        // Verificando o nome do arquivo
        console.log('Generated fileName:', fileName);

        const fileDirectory = path.resolve(process.cwd(), 'files');
        console.log('fileDirectory:', fileDirectory);

        const fileLocale = path.join(fileDirectory, fileName);
        console.log('fileLocale:', fileLocale);

        if (!file.buffer) {
          throw new Error('O arquivo não contém buffer válido');
        }

        await fs.writeFile(fileLocale, file.buffer);

        const urlImage = await this.prisma.image.create({
          data: {
            productId: productId,
            image: `/files/${fileName}`,
          },
          select: {
            id: true,
            image: true,
          },
        });

        savedImages.push(urlImage);
      }

      console.log('savedImages:', savedImages);
      return savedImages;
    } catch (error) {
      throw new HttpException(
        'Falha ao fazer o upload das imagens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadImagesCloudinary(
    productId: string,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const savedImages: { id: string; image: string }[] = [];

      if (!files || files.length === 0) {
        throw new Error('Nenhum arquivo foi enviado.');
      }

      // Verificação de tipo para productId
      if (typeof productId !== 'string') {
        throw new Error('productId deve ser uma string');
      }

      // Realiza o upload das imagens no Cloudinary
      for (const file of files) {
        const fileExtension = path
          .extname(file.originalname)
          .toLowerCase()
          .substring(1);
        const fileName = `${productId}.${fileExtension}`;

        // Verificando o nome do arquivo
        // console.log('Generated fileName:', fileName);

        // Enviando para o Cloudinary usando upload_stream
        const uploadedImage = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { public_id: fileName, resource_type: 'auto' },
              async (error, result) => {
                if (error) {
                  console.log('Error uploading to Cloudinary:', error);
                  reject(
                    new HttpException(
                      'Falha ao fazer o upload das imagens para o Cloudinary',
                      HttpStatus.BAD_REQUEST,
                    ),
                  );
                } else {
                  resolve(result);
                }
              },
            )
            .end(file.buffer); // Usa o método .end() para passar o buffer
        });

        // Salva a URL da imagem no banco de dados (Prisma)
        const urlImage = await this.prisma.image.create({
          data: {
            productId: productId,
            image: uploadedImage?.secure_url, // A URL gerada no Cloudinary
          },
          select: {
            id: true,
            image: true,
          },
        });

        savedImages.push(urlImage);
      }

      // console.log('savedImages:', savedImages);
      return savedImages;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao fazer o upload das imagens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const {
        limit = 10,
        offset = 0,
        category,
        price,
        '-price': maxPrice,
        brand,
        tags,
        bigsale,
        rating,
      } = paginationDto;

      // Prepara o filtro de preço
      let priceFilter: { price?: { gte?: number; lte?: number } } = {}; // Definindo a estrutura
      if (price) {
        priceFilter = {
          ...priceFilter,
          price: { gte: parseFloat(price.toString()) },
        };
      }
      if (maxPrice) {
        priceFilter = {
          ...priceFilter,
          price: { ...priceFilter.price, lte: parseFloat(maxPrice.toString()) },
        };
      }

      // Filtro para categoria
      let categoryFilter: { category?: string } = {}; // Definindo a estrutura
      if (category) {
        categoryFilter = { category: category };
      }

      // Filtro para marca
      let brandFilter: { brand?: string } = {}; // Definindo a estrutura
      if (brand) {
        brandFilter = { brand: brand };
      }

      // Filtro de tags (verifica se é uma string e converte para array)
      let tagsFilter: { tags?: { hasSome: string[] } } = {};
      if (tags) {
        const tagArray =
          typeof tags === 'string'
            ? tags.split(',').map((tag) => tag.trim())
            : tags;
        tagsFilter = { tags: { hasSome: tagArray } };
      }

      // Função para processar o valor de bigsale como booleano
      let bigsaleFilter: { bigsale?: boolean } = {};

      if (bigsale !== undefined) {
        // Convertendo a query string para um booleano corretamente
        bigsaleFilter = { bigsale: bigsale === 'true' }; // ou 'false' para falso
      }

      // Filtro para avaliação
      let assessmentFilter: { rating?: { gte: number } } = {}; // Definindo a estrutura
      if (rating) {
        assessmentFilter = {
          rating: { gte: parseInt(rating.toString()) },
        };
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
          images: true,
        },
      });

      return products;
    } catch (error) {
      throw new HttpException(
        `Falha ao listar produtos ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findFirst({
        where: {
          id: id,
        },
        include: {
          images: true,
        },
      });
      return product;
    } catch (error) {
      throw new HttpException(
        `Falha ao listar produto ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: {
        id: id,
      },
      data: {
        title: updateProductDto.title,
        price: updateProductDto.price,
        old_price: updateProductDto.old_price,
        rating: updateProductDto.rating,
        promotion_time: updateProductDto.promotion_time,
        description: updateProductDto.description,
        products_sold: updateProductDto.products_sold,
        endDate: updateProductDto.endDate,
        bigsale: updateProductDto.bigsale,
        stock: updateProductDto.stock,
        category: updateProductDto.category?.toLowerCase(),
        categoryId: updateProductDto.categoryId,
        brand: updateProductDto.brand?.toLowerCase(),
        tags: updateProductDto.tags?.map((tag) => tag.toLowerCase()),
        weight: updateProductDto.weight,
        width: updateProductDto.width,
        height: updateProductDto.height,
        length: updateProductDto.length,
        isActive: updateProductDto.isActive,
        featured: updateProductDto.featured,
        color: updateProductDto.color || [],
        size: updateProductDto.size || [],
      },
      include: {
        images: true,
      },
    });
    return product;
  }

  async remove(id: string) {
    await this.prisma.product.delete({
      where: {
        id: id,
      },
    });
    return `This action removes a #${id} product`;
  }
}
