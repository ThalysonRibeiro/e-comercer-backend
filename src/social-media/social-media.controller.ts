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

@Controller('social-media')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Post('admin')
  create(@Body() createSocialMediaDto: CreateSocialMediaDto) {
    return this.socialMediaService.create(createSocialMediaDto);
  }

  @Get()
  findAll() {
    return this.socialMediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.socialMediaService.findOne(id);
  }

  @Patch('admin/:id')
  update(
    @Param('id') id: string,
    @Body() updateSocialMediaDto: UpdateSocialMediaDto,
  ) {
    return this.socialMediaService.update(id, updateSocialMediaDto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.socialMediaService.remove(id);
  }
}
