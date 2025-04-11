import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  discount_value: number;

  @IsNotEmpty()
  @IsNumber()
  discount_type: number;

  @IsOptional()
  @IsNumber()
  min_purchase: number;

  @IsOptional()
  @IsNumber()
  max_usage: number;

  @IsOptional()
  @IsNumber()
  used_count: number;

  @IsNotEmpty()
  @IsNumber()
  start_date: number;

  @IsBoolean()
  isActive: boolean;
}
