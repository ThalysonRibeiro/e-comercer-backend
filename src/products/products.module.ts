import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ImagesService } from 'src/images/images.service';

@Module({
  imports: [ConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, ImagesService],
})
export class ProductsModule {}
