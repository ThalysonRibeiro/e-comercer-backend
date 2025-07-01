import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, PrismaService, ImagesService],
})
export class BrandsModule {}
