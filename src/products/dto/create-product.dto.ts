import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  rating?: number;

  @IsOptional()
  @IsNumber()
  promotion_time: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @IsNumber()
  products_sold: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsBoolean()
  bigsale: boolean;

  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsNumber()
  @Type(() => Number)
  width: number;

  @IsNumber()
  @Type(() => Number)
  height: number;

  @IsNumber()
  @Type(() => Number)
  length: number;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  featured: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  color: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  size: string[];

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsBoolean()
  emphasis: boolean;
}
