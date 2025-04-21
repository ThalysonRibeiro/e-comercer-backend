import { Module } from '@nestjs/common';
import { ThemeColorService } from './theme-color.service';
import { ThemeColorController } from './theme-color.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ThemeColorController],
  providers: [ThemeColorService, PrismaService],
})
export class ThemeColorModule { }
