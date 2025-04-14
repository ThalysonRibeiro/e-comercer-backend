import { PartialType } from '@nestjs/mapped-types';
import { CreatePromotionHeroDto } from './create-promotion-hero.dto';

export class UpdatePromotionHeroDto extends PartialType(
  CreatePromotionHeroDto,
) {}
