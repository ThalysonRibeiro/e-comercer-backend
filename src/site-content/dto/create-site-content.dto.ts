import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSiteContentDto {
  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  bg_video?: string;

  @IsOptional()
  @IsString()
  image_logo?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  keywords: Array<string>;

  @IsOptional()
  @IsString()
  image_openGraph: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
