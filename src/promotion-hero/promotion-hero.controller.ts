import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Put,
  ParseFilePipeBuilder,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PromotionHeroService } from './promotion-hero.service';
import { CreatePromotionHeroDto } from './dto/create-promotion-hero.dto';
import { UpdatePromotionHeroDto } from './dto/update-promotion-hero.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/auth/decorators/public.decorator';
import { AllPromotionHero } from 'src/common/dto/all-promotions-hero.dto';

@Controller('promotion-hero')
export class PromotionHeroController {
  constructor(private readonly promotionHeroService: PromotionHeroService) { }

  @Post('admin')
  create(@Body() createPromotionHeroDto: CreatePromotionHeroDto) {
    return this.promotionHeroService.create(createPromotionHeroDto);
  }

  @Roles(AccountType.useradmin)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @Put('image/admin/:id')
  image(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png|webp/g,
        })
        .addMaxSizeValidator({
          maxSize: 6 * (1024 * 1024), // 6MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.promotionHeroService.uploadImage(id, file);
  }

  @Public()
  @Get()
  findAll(@Query() allPromotionHero: AllPromotionHero) {
    return this.promotionHeroService.findAll(allPromotionHero);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionHeroService.findOne(id);
  }

  @Roles(AccountType.useradmin)
  @Patch('/admin:id')
  update(
    @Param('id') id: string,
    @Body() updatePromotionHeroDto: UpdatePromotionHeroDto,
  ) {
    return this.promotionHeroService.update(id, updatePromotionHeroDto);
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.promotionHeroService.remove(id);
  }
}
