import { Module } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { ContactInfoController } from './contact-info.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ContactInfoController],
  providers: [ContactInfoService, PrismaService],
})
export class ContactInfoModule { }
