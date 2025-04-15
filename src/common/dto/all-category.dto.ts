import { IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AllCategoryDto {
  @IsOptional()
  @IsIn(['true', 'false'], {
    message: 'hasChildren deve ser "true" ou "false"',
  })
  hasChildren?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit deve ser um número inteiro' })
  @Min(1, { message: 'limit deve ser maior que 0' })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset deve ser um número inteiro' })
  @Min(0, { message: 'offset deve ser maior ou igual a 0' })
  offset?: number;
}
