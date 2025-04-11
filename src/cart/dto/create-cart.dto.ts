import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  itemId: string;

  @IsOptional()
  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  color: string[];

  @IsOptional()
  size: string[];
}
