import { PartialType } from '@nestjs/mapped-types';
import { CreateThemeColorDto } from './create-theme-color.dto';

export class UpdateThemeColorDto extends PartialType(CreateThemeColorDto) {}
