import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  async create(createCartDto: CreateCartDto) {
    if (!createCartDto.userId) {
      throw new HttpException(
        'User ID is required to create a cart',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: createCartDto.userId },
    });

    if (!userExists) {
      throw new HttpException(
        `User with ID ${createCartDto.userId} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const existingCart = await this.prisma.cart.findUnique({
        where: { userId: createCartDto.userId },
        include: { items: true },
      });

      let cart;

      if (existingCart) {
        cart = existingCart;
      } else {
        // Criar o carrinho primeiro
        cart = await this.prisma.cart.create({
          data: {
            user: {
              connect: { id: createCartDto.userId },
            },
          },
          include: {
            items: true,
            user: {
              select: {
                id: true,
                status: true,
                name: true,
                cpf_or_cnpj: true,
                email: true,
                dateOfBirth: true,
                phone: true,
                emailVerified: true,
                avatar: true,
              },
            },
          },
        });
      }

      const existingItem = cart.items.find(
        (item) =>
          item.productId === createCartDto.productId &&
          JSON.stringify(item.color) ===
          JSON.stringify(createCartDto.color || []) &&
          JSON.stringify(item.size) ===
          JSON.stringify(createCartDto.size || []),
      );

      if (!existingItem) {
        // Criar o item do carrinho
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: createCartDto.productId,
            quantity: createCartDto.quantity || 1,
            color: createCartDto.color || [],
            size: createCartDto.size || [],
            price: createCartDto.price,
            totalPrice: createCartDto.totalPrice,
          },
        });
      } else {
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + (createCartDto.quantity || 1),
          },
        });
      }

      // Buscar o carrinho atualizado com o novo item
      const updatedCart = await this.prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              status: true,
              name: true,
              cpf_or_cnpj: true,
              email: true,
              dateOfBirth: true,
              phone: true,
              emailVerified: true,
              avatar: true,
            },
          },
        },
      });

      return updatedCart;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        `Erro ao criar o cart ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.cart.findMany({
        include: {
          items: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao lista os cart ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new HttpException(
        'o id do item é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.prisma.cart.findFirst({
        include: {
          items: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao lista os cart ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async editeCart(updateCartDto: UpdateCartDto) {
    try {
      return await this.prisma.cartItem.update({
        where: { id: updateCartDto.itemId },
        data: {
          quantity: updateCartDto.quantity,
          color: updateCartDto.color,
          size: updateCartDto.size,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao atualizar o item do cart ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeItem(itemId: string) {
    if (!itemId) {
      throw new HttpException(
        'o id do item é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.prisma.cartItem.delete({
        where: {
          id: itemId,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao deletar o item do cart ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeCart(itemId: string) {
    if (!itemId) {
      throw new HttpException(
        'o id do item é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.prisma.cart.delete({
        where: {
          id: itemId,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao deletar o item do cart ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
