import { IsOptional, IsInt, IsString, IsArray, IsBoolean, IsNumber, Min, Max, IsDateString, isString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  '-price'?: number; // Para o filtro de preço máximo

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  tags?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  bigsale?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  assessment?: number; // Avaliação do produto, por exemplo de 0 a 5
}
