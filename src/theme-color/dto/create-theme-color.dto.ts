import { IsBoolean, IsOptional, IsString } from "class-validator"

export class CreateThemeColorDto {

  @IsOptional()
  @IsString()
  siteContentId: string;

  @IsOptional()
  @IsString()
  nameTheme: string;

  @IsOptional()
  @IsString()
  primaryColor: string;

  @IsOptional()
  @IsString()
  secondaryColor: string;

  @IsOptional()
  @IsString()
  hover: string;

  @IsOptional()
  @IsString()
  star: string;

  @IsOptional()
  @IsString()
  danger: string;

  @IsOptional()
  @IsBoolean()
  isDarkTheme: boolean;

  @IsOptional()
  @IsString()
  shadowColor: string;

  @IsOptional()
  @IsString()
  success: string;

  @IsOptional()
  @IsString()
  warning: string;

  @IsOptional()
  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  textColor: string;

  @IsOptional()
  @IsString()
  textHover: string;

  @IsOptional()
  @IsString()
  oldPrice: string;

  @IsOptional()
  @IsString()
  borderColor: string;

  @IsOptional()
  @IsString()
  textButton: string;

  @IsOptional()
  @IsString()
  bgCard: string;

  @IsOptional()
  @IsString()
  themeColor: string;

  @IsOptional()
  @IsBoolean()
  themeSelected: boolean;
}

