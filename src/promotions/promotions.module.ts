import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';

@Module({
  controllers: [PromotionsController],
  providers: [PromotionsService, PrismaService, ImagesService],
})
export class PromotionsModule {}
