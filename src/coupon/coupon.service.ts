import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CouponType } from '@prisma/client';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) { }

  async create(createCouponDto: CreateCouponDto) {
    try {
      const dateFuture = new Date();
      dateFuture.setDate(dateFuture.getDate() + createCouponDto.start_date);

      const coupon = await this.prisma.coupon.create({
        data: {
          code: createCouponDto.code?.toLowerCase(),
          discount_value: createCouponDto.discount_value,
          discount_type: createCouponDto.discount_type === 'FIXED'
            ? CouponType.FIXED
            : CouponType.PERCENTAGE,
          min_purchase: createCouponDto.min_purchase,
          max_usage: createCouponDto.max_usage,
          used_count: createCouponDto.used_count,
          start_date: createCouponDto.start_date,
          end_date: dateFuture,
          isActive: createCouponDto.isActive,
        },
      });
      return coupon;
    } catch (error) {
      throw new HttpException(
        `Erro ao criar cupom ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.coupon.findMany();
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar cupons ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.coupon.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar cupom ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    if (!updateCouponDto.start_date) {
      throw new HttpException(
        'A quantidade de dias é obrigatória',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const dateFuture = new Date();
      dateFuture.setDate(dateFuture.getDate() + updateCouponDto.start_date);

      const coupon = await this.prisma.coupon.update({
        where: { id: id },
        data: {
          code: updateCouponDto.code?.toLowerCase(),
          discount_value: updateCouponDto.discount_value,
          discount_type: updateCouponDto.discount_type === 'FIXED'
            ? CouponType.FIXED
            : CouponType.PERCENTAGE,
          min_purchase: updateCouponDto.min_purchase,
          max_usage: updateCouponDto.max_usage,
          used_count: updateCouponDto.used_count,
          start_date: updateCouponDto.start_date,
          end_date: dateFuture,
          isActive: updateCouponDto.isActive,
        },
      });
      return coupon;
    } catch (error) {
      throw new HttpException(
        `Erro ao atualizar cupom ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.coupon.delete({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao deletar cupom ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkCoupon(code: string) {
    if (!code) {
      throw new HttpException(
        `Erro ao validar cupom ${code}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.prisma.coupon.findFirst({
        where: { code: code },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao validar cupon ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
