import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionHeroDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  promotionLink?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsBoolean()
  isActive: boolean;

  @IsNumber()
  order: number;

  @IsNumber()
  startDate: number;

  @IsString()
  siteContentId: string;
}
