import { IsOptional, IsString } from "class-validator";

export class ThemeFilters {
  @IsOptional()
  @IsString()
  isDarkTheme?: string;
}