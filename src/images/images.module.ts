import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ImagesService, PrismaService]
})
export class ImagesModule { }
