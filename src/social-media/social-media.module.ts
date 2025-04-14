import { Module } from '@nestjs/common';
import { SocialMediaService } from './social-media.service';
import { SocialMediaController } from './social-media.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SocialMediaController],
  providers: [SocialMediaService, PrismaService],
})
export class SocialMediaModule {}
