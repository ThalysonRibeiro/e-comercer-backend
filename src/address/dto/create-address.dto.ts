import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP deve estar no formato 12345-678' })
  zip: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  complemento: string;

  @IsNotEmpty()
  @IsString()
  addressType: string;

  @IsOptional()
  @IsBoolean()
  isDefault: boolean;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
