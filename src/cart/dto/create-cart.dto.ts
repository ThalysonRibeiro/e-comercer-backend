import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  totalPrice: number;

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

  @IsOptional()
  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  totalItems: number;

  @IsOptional()
  @IsBoolean()
  hasDiscount: boolean;

  @IsOptional()
  @IsNumber()
  discountAmount: number;

  @IsOptional()
  @IsString()
  appliedCoupon: string;
}
