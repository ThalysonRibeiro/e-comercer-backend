import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { log } from 'node:console';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) { }

  async create(createCouponDto: CreateCouponDto) {

    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + createCouponDto.start_date);

    const coupon = await this.prisma.coupon.create({
      data: {
        code: createCouponDto.code?.toLowerCase(),
        discount_value: createCouponDto.discount_value,
        discount_type: createCouponDto.discount_type,
        min_purchase: createCouponDto.min_purchase,
        max_usage: createCouponDto.max_usage,
        used_count: createCouponDto.used_count,
        start_date: createCouponDto.start_date,
        end_date: dateFuture,
        isActive: createCouponDto.isActive
      }
    });
    return coupon;
  }

  async findAll() {
    return await this.prisma.coupon.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.coupon.findUnique({
      where: { id: id }
    });
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    if (!updateCouponDto.start_date) {
      throw new HttpException(
        'A quantidade de dias é obrigatória',
        HttpStatus.BAD_REQUEST,
      );
    }
    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + updateCouponDto.start_date);

    const coupon = await this.prisma.coupon.update({
      where: { id: id },
      data: {
        code: updateCouponDto.code?.toLowerCase(),
        discount_value: updateCouponDto.discount_value,
        discount_type: updateCouponDto.discount_type,
        min_purchase: updateCouponDto.min_purchase,
        max_usage: updateCouponDto.max_usage,
        used_count: updateCouponDto.used_count,
        start_date: updateCouponDto.start_date,
        end_date: dateFuture,
        isActive: updateCouponDto.isActive
      }
    });
    return coupon;
  }

  async remove(id: string) {
    return await this.prisma.coupon.delete({
      where: { id: id }
    });
  }

  async checkCoupon(code: string) {
    return await this.prisma.coupon.findFirst({
      where: { code: code }
    });
  }
}
