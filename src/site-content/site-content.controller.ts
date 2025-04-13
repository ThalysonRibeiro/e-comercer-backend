import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SiteContentService } from './site-content.service';
import { CreateSiteContentDto } from './dto/create-site-content.dto';
import { UpdateSiteContentDto } from './dto/update-site-content.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/auth/decorators/public.decorator';


@Controller('site-content/admin')
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) { }

  @Roles(AccountType.useradmin)
  @Post()
  create(@Body() createSiteContentDto: CreateSiteContentDto) {
    return this.siteContentService.create(createSiteContentDto);
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    })
  )
  @Roles(AccountType.useradmin)
  @Post('banner/:id')
  uploadBanner(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png|webp/g,
        })
        .addMaxSizeValidator({
          maxSize: 6 * (1024 * 1024), // 6MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.siteContentService.uploadBanner(id, file)
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    })
  )
  @Roles(AccountType.useradmin)
  @Post('video/:id')
  uploadVideo(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /mp4/g,
        })
        .addMaxSizeValidator({
          maxSize: 50 * (1024 * 1024), // 50MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.siteContentService.uploadVideo(id, file)
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    })
  )
  @Roles(AccountType.useradmin)
  @Post('bg_video/:id')
  uploadBGVideo(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /mp4/g,
        })
        .addMaxSizeValidator({
          maxSize: 50 * (1024 * 1024), // 50MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.siteContentService.uploadBGVideo(id, file)
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    })
  )
  @Roles(AccountType.useradmin)
  @Post('logo/:id')
  uploadLogo(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png|webp/g,
        })
        .addMaxSizeValidator({
          maxSize: 6 * (1024 * 1024), // 6MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.siteContentService.uploadLogo(id, file)
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    })
  )
  @Roles(AccountType.useradmin)
  @Post('favicon/:id')
  uploadFavicon(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /ico/g,
        })
        .addMaxSizeValidator({
          maxSize: 6 * (1024 * 1024), // 6MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.siteContentService.uploadFavicon(id, file)
  }

  @Public()
  @Get()
  findAll() {
    return this.siteContentService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteContentService.findOne(id);
  }

  @Roles(AccountType.useradmin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSiteContentDto: UpdateSiteContentDto,
  ) {
    return this.siteContentService.update(id, updateSiteContentDto);
  }

  @Roles(AccountType.useradmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siteContentService.remove(id);
  }
}
