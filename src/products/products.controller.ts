import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Roles(AccountType.useradmin)
  @Post('admin')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }


  @UseInterceptors(FilesInterceptor('files', 10)) // Limita o número de arquivos para 10
  @Post('admin/image')
  async images(
    @Body() body: { productId: string }, // O body contém o productId
    @UploadedFiles(
      new ParseFilePipeBuilder()
        // .addFileTypeValidator({
        //   fileType: /jpeg|jpg|png|webp/, // Validação do tipo de arquivo
        // })
        .addMaxSizeValidator({
          maxSize: 6 * (1024 * 1024), // Limite de tamanho de arquivo para 6MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, // Retorna erro de tipo 422
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const { productId } = body;
    return this.productsService.uploadImagesCloudinary(productId, files);
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
  @Patch('admin/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  removeProduct(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
