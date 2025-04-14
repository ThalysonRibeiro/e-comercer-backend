import { Module } from '@nestjs/common';
import { PromotionHeroService } from './promotion-hero.service';
import { PromotionHeroController } from './promotion-hero.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';

@Module({
  controllers: [PromotionHeroController],
  providers: [PromotionHeroService, PrismaService, ImagesService],
})
export class PromotionHeroModule {}
