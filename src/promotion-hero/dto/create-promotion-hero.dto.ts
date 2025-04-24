import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionHeroDto {
  @IsString()
  title: string;

  @IsString()
  subTitle: string;

  @IsString()
  sale: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsString()
  buttonLink?: string;

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
