import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CouponController],
  providers: [CouponService, PrismaService],
})
export class CouponModule {}
