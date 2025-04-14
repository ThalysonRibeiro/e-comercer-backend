import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SocialMediaService } from './social-media.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('social-media')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) { }

  @Roles(AccountType.useradmin)
  @Post('admin')
  create(@Body() createSocialMediaDto: CreateSocialMediaDto) {
    return this.socialMediaService.create(createSocialMediaDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.socialMediaService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.socialMediaService.findOne(id);
  }

  @Roles(AccountType.useradmin)
  @Patch('admin/:id')
  update(
    @Param('id') id: string,
    @Body() updateSocialMediaDto: UpdateSocialMediaDto,
  ) {
    return this.socialMediaService.update(id, updateSocialMediaDto);
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.socialMediaService.remove(id);
  }
}
