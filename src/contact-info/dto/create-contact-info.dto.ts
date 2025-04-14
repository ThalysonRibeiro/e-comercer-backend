import { IsOptional, IsString } from 'class-validator';

export class CreateContactInfoDto {
  @IsString()
  siteContentId: string;

  @IsString()
  type: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  label?: string;
}
