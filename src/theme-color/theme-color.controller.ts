import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ThemeColorService } from './theme-color.service';
import { CreateThemeColorDto } from './dto/create-theme-color.dto';
import { UpdateThemeColorDto } from './dto/update-theme-color.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';
import { ThemeFilters } from 'src/common/dto/all-theme-filter.dto';

@Controller('theme-color')
export class ThemeColorController {
  constructor(private readonly themeColorService: ThemeColorService) { }

  @Roles(AccountType.useradmin)
  @Post('admin')
  create(@Body() createThemeColorDto: CreateThemeColorDto) {
    return this.themeColorService.create(createThemeColorDto);
  }

  @Public()
  @Get()
  findAll(@Query() themeFilters: ThemeFilters) {
    return this.themeColorService.findAll(themeFilters);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.themeColorService.findOne(id);
  }

  @Roles(AccountType.useradmin)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() updateThemeColorDto: UpdateThemeColorDto) {
    return this.themeColorService.update(id, updateThemeColorDto);
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.themeColorService.remove(id);
  }
}
