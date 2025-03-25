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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';



@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Roles(AccountType.useradmin)
  @Post()
  createProducts(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Public()
  @Get(':id')
  findOneProduct(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Roles(AccountType.useradmin)
  @Patch(':id')
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(AccountType.useradmin)
  @Delete(':id')
  removeProduct(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
