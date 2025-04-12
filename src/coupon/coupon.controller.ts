import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Roles(AccountType.useradmin)
  @Post('admin')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Roles(AccountType.useradmin)
  @Get('admin')
  findAll() {
    return this.couponService.findAll();
  }

  @Roles(AccountType.useradmin)
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Roles(AccountType.useradmin)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }

  @Get('check/:code')
  check(@Param('code') code: string) {
    return this.couponService.checkCoupon(code);
  }
}
