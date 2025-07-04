import { Module } from '@nestjs/common';
import { TokenBlacklistService } from './token-blacklist.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class TokenBlacklistModule {}
