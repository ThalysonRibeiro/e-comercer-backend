import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ProductsFilterDto } from 'src/common/dto/all-pprodutcs-filter.dto';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { ImagesService } from 'src/images/images.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private imagesService: ImagesService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async create(createProductDto: CreateProductDto) {
    if (!createProductDto) {
      throw new Error('Product data is required');
    }

    if (!createProductDto.title) {
      throw new Error('Product title is required');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId }
    });

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
          category: category?.name ? category?.name.toLowerCase() : createProductDto.category,
          categoryId: createProductDto.categoryId,
          brand: createProductDto.brand.toLowerCase(),
          tags: createProductDto.tags.map((tag) => tag.toLowerCase()),
          weight: createProductDto.weight,
          width: createProductDto.width,
          height: createProductDto.height,
          length: createProductDto.length,
          isActive: createProductDto.isActive,
          featured: createProductDto.featured,
          emphasis: createProductDto.emphasis,
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

        const fileDirectory = path.resolve(process.cwd(), 'files');

        const fileLocale = path.join(fileDirectory, fileName);

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
        const fileName = `${crypto.randomInt(1000) + productId}.${fileExtension}`;

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

  async uploadImagesCloudinary2(
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

      const uploadedImage = await this.imagesService.postImages(
        productId,
        files,
      );
      console.log('uploadedImage:', uploadedImage, typeof uploadedImage);

      // Tratamento para diferentes formatos possíveis
      let imageUrls: string[] = [];

      // Caso 1: É uma string simples
      if (typeof uploadedImage === 'string') {
        imageUrls = [uploadedImage];
      }
      // Caso 2: É um array de strings
      else if (
        Array.isArray(uploadedImage) &&
        uploadedImage.every((item) => typeof item === 'string')
      ) {
        imageUrls = uploadedImage;
      }
      // Caso 3: É um objeto com uma propriedade url ou secure_url (comum em respostas do Cloudinary)
      else if (
        uploadedImage &&
        typeof uploadedImage === 'object' &&
        !Array.isArray(uploadedImage)
      ) {
        if ('url' in uploadedImage) imageUrls = [uploadedImage];
        else if ('secure_url' in uploadedImage) imageUrls = [uploadedImage];
        else if ('image' in uploadedImage) imageUrls = [uploadedImage];
      }
      // Caso 4: É um array de objetos com propriedades url ou secure_url
      else if (
        Array.isArray(uploadedImage) &&
        uploadedImage.length > 0 &&
        typeof uploadedImage[0] === 'object'
      ) {
        imageUrls = uploadedImage
          .map((item) => {
            if ('url' in item) return item.url;
            if ('secure_url' in item) return item.secure_url;
            if ('image' in item) return item.image;
            return null;
          })
          .filter((url) => url !== null) as string[];
      }

      // Se não conseguimos extrair nenhuma URL
      if (imageUrls.length === 0) {
        console.error('Formato de resposta:', uploadedImage);
        throw new Error('Formato de resposta inesperado do serviço de imagens');
      }

      // Salvamos cada URL no banco de dados
      for (const imageUrl of imageUrls) {
        const urlImage = await this.prisma.image.create({
          data: {
            productId: productId,
            image: imageUrl,
          },
          select: {
            id: true,
            image: true,
          },
        });
        savedImages.push(urlImage);
      }

      return savedImages;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao fazer o upload das imagens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(productsFilterDto: ProductsFilterDto) {
    try {
      const {
        limit,
        offset,
        category,
        price,
        '-price': maxPrice,
        brand,
        tags,
        bigsale,
        rating,
        endDate,
        isActive,
        featured,
        stock,
        emphasis,
        sort
      } = productsFilterDto;

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

      // filtro active
      let isActiveFilter: { isActive?: boolean } = {};

      if (isActive !== undefined) {
        // Convertendo a query string para um booleano corretamente
        isActiveFilter = { isActive: isActive === 'true' }; // ou 'false' para falso
      }
      // featured
      let featuredFilter: { featured?: boolean } = {};

      if (featured !== undefined) {
        // Convertendo a query string para um booleano corretamente
        featuredFilter = { featured: featured === 'true' }; // ou 'false' para falso
      }

      //stok
      let whereClause = {};

      if (stock === 'true') {
        whereClause = {
          stock: {
            gt: 0,
          },
        };
      }
      //emphasis
      let emphasisFilter: { emphasis?: boolean } = {};

      if (emphasis !== undefined) {
        // Convertendo a query string para um booleano corretamente
        emphasisFilter = { emphasis: emphasis === 'true' }; // ou 'false' para falso
      }

      // Mapeando o tipo de ordenação
      let orderBy: { [key: string]: 'asc' | 'desc' } = { createdAt: 'desc' };

      if (sort) {
        switch (sort) {
          case 'az':
            orderBy = { title: 'asc' };
            break;
          case 'za':
            orderBy = { title: 'desc' };
            break;
          case 'priceAsc':
            orderBy = { price: 'asc' };
            break;
          case 'priceDesc':
            orderBy = { price: 'desc' };
            break;
          case 'topRated':
            orderBy = { rating: 'desc' };
            break;
          case 'bestSelling':
            orderBy = { products_sold: 'desc' };
            break;
          case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
          case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
          default:
            orderBy = { createdAt: 'desc' };
            break;
        }
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
          ...endDateQueryFilter,
          ...isActiveFilter,
          ...featuredFilter,
          ...whereClause,
          ...emphasisFilter,
        },
        take: limit,
        skip: offset,
        orderBy: orderBy,
        include: {
          images: true,
          reviews: true,
        },
      });

      const total = await this.prisma.product.count({
        where: {
          ...categoryFilter,
          ...priceFilter,
          ...brandFilter,
          ...tagsFilter,
          ...bigsaleFilter,
          ...assessmentFilter,
          ...endDateQueryFilter,
          ...isActiveFilter,
          ...featuredFilter,
          ...whereClause,
          ...emphasisFilter,
        }
      });

      return { products, total };
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
          reviews: true,
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
        emphasis: updateProductDto.emphasis,
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
