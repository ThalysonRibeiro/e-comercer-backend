import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @Roles(AccountType.useradmin)
  @Post('admin')
  create(@Body() createContactInfoDto: CreateContactInfoDto) {
    return this.contactInfoService.create(createContactInfoDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.contactInfoService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactInfoService.findOne(id);
  }

  @Roles(AccountType.useradmin)
  @Patch('admin/:id')
  update(
    @Param('id') id: string,
    @Body() updateContactInfoDto: UpdateContactInfoDto,
  ) {
    return this.contactInfoService.update(id, updateContactInfoDto);
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.contactInfoService.remove(id);
  }
}
