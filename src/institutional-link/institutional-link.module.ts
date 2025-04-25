import { Module } from '@nestjs/common';
import { InstitutionalLinkService } from './institutional-link.service';
import { InstitutionalLinkController } from './institutional-link.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [InstitutionalLinkController],
  providers: [InstitutionalLinkService, PrismaService],
})
export class InstitutionalLinkModule { }
