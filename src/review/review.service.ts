import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    if (!createReviewDto.userId && !createReviewDto.productId) {
      throw new HttpException(
        'O userId e o productId é necessário para criar uma avaliação',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: createReviewDto.userId },
    });

    if (!user) {
      return;
    }

    try {
      const review = await this.prisma.review.create({
        data: {
          userId: createReviewDto.userId,
          productId: createReviewDto.productId,
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          title: createReviewDto.title || user?.name,
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });

      return review;
    } catch (error) {
      throw new HttpException(
        'Erro ao criar avaliação',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAllReviewUser(id: string) {
    if (!id) {
      throw new HttpException('o ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.review.findMany({
        where: { userId: id },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar avaliação',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAllReviewProduct(id: string) {
    if (!id) {
      throw new HttpException('o ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.review.findMany({
        where: { productId: id },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar avaliação',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAllReview() {
    try {
      return await this.prisma.review.findMany({
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar avaliação',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    if (!id) {
      throw new HttpException('o ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    if (!updateReviewDto.userId && !updateReviewDto.productId) {
      throw new HttpException(
        'O userId e o productId é necessário para criar uma avaliação',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: updateReviewDto.userId },
    });

    if (!user) {
      return;
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { id: id },
    });

    if (!existingReview) {
      return;
    }

    try {
      const review = await this.prisma.review.update({
        where: { id: id },
        data: {
          userId: updateReviewDto.userId || existingReview.userId,
          productId: updateReviewDto.productId || existingReview.productId,
          rating: updateReviewDto.rating || existingReview.rating,
          comment: updateReviewDto.comment,
          title: updateReviewDto.title || user?.name,
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      });

      return review;
    } catch (error) {
      throw new HttpException(
        'Erro ao editar avaliação',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new HttpException('o ID é obrigatório', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.prisma.review.delete({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException('Erro ao deletar review', HttpStatus.BAD_REQUEST);
    }
  }
}
