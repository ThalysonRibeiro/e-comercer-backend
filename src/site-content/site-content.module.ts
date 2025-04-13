import { Module } from '@nestjs/common';
import { SiteContentService } from './site-content.service';
import { SiteContentController } from './site-content.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';

@Module({
  controllers: [SiteContentController],
  providers: [SiteContentService, PrismaService, ImagesService],
})
export class SiteContentModule { }
