import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }
  @Roles(AccountType.useradmin)
  @Get('admin')
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Patch()
  editeCart(@Body() updateCartDto: UpdateCartDto) {
    return this.cartService.editeCart(updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Delete('all/:id')
  removeCart(@Param('id') itemId: string) {
    return this.cartService.removeCart(itemId);
  }
}
