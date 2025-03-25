import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDate,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImageDto {
  @IsNotEmpty()
  @IsString()
  image: string;
}

export class OptionsCreateInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionsDto)
  create: OptionsDto[];
}
export class OptionsDto {
  @IsArray()
  @IsString({ each: true })
  color: string[];

  @IsArray()
  @IsString({ each: true })
  size: string[];
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNumber()
  old_price: number;

  @IsOptional()
  @IsNumber()
  assessment?: number;

  @IsNumber()
  promotion_time: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @IsNumber()
  products_sold: number;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsBoolean()
  bigsale: boolean;

  @IsNumber()
  stock: number;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionsCreateInput)
  options: OptionsCreateInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];
}
