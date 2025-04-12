import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) { }

  async create(createWishlistDto: CreateWishlistDto) {
    if (!createWishlistDto.userId) {
      throw new HttpException(
        'O ID do usuário é necessário para criar uma lista de desejos',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!createWishlistDto.productId) {
      throw new HttpException(
        'productId é necessário para criar uma lista de desejos',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const existingWishlistItem = await this.prisma.wishlistItem.findFirst({
        where: { productId: createWishlistDto.productId }
      });

      if (existingWishlistItem) {
        return;
      }

      const existingWishlist = await this.prisma.wishlist.findFirst({
        where: { userId: createWishlistDto.userId },
        include: {
          items: true
        }
      });
      if (!existingWishlist) {

        const wishlist = await this.prisma.wishlist.create({
          data: {
            user: {
              connect: { id: createWishlistDto.userId },
            },
          },
          include: {
            items: true
          }
        });
        await this.prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId: createWishlistDto.productId
          }
        });
        return wishlist
      }

      const wishlistItem = await this.prisma.wishlistItem.create({
        data: {
          wishlistId: existingWishlist.id,
          productId: createWishlistDto.productId
        }
      })

      return wishlistItem
    } catch (error) {
      throw new HttpException(
        'Erro ao criar lista de items desejos',
        HttpStatus.BAD_REQUEST,
      );
    }

  }

  async findAll() {
    try {
      return await this.prisma.wishlist.findMany({
        include: {
          items: {
            select: {
              id: true,
              wishlistId: true,
              productId: true,
              createdAt: true,
              updatedAt: true,
              product: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao bustar todas as lista de desejos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.wishlist.findUnique({
        where: { id: id },
        include: {
          items: {
            select: {
              id: true,
              wishlistId: true,
              productId: true,
              createdAt: true,
              updatedAt: true,
              product: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar item favorito',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException(
        'o id é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.prisma.wishlistItem.delete({
        where: { id: id }
      })
    } catch (error) {
      throw new HttpException(
        'erro ao remover o item da lista de desejos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
