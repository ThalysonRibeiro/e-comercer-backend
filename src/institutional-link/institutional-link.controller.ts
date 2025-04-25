import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstitutionalLinkService } from './institutional-link.service';
import { CreateInstitutionalLinkDto } from './dto/create-institutional-link.dto';
import { UpdateInstitutionalLinkDto } from './dto/update-institutional-link.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';

@Roles(AccountType.useradmin)
@Controller('institutional-link/admin')
export class InstitutionalLinkController {
  constructor(private readonly institutionalLinkService: InstitutionalLinkService) { }

  @Post()
  create(@Body() createInstitutionalLinkDto: CreateInstitutionalLinkDto) {
    return this.institutionalLinkService.create(createInstitutionalLinkDto);
  }

  @Get()
  findAll() {
    return this.institutionalLinkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.institutionalLinkService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstitutionalLinkDto: UpdateInstitutionalLinkDto) {
    return this.institutionalLinkService.update(id, updateInstitutionalLinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.institutionalLinkService.remove(id);
  }
}
