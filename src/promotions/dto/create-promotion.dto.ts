import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePromotionDto {

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsNumber()
  startDate?: number;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsString()
  buttonLink?: string;

  @IsString()
  position: string;

  @IsString()
  siteContentId: string;
}
