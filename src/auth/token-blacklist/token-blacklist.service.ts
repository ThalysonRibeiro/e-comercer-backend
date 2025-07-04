import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TokenBlacklistService {
  constructor(private readonly prisma: PrismaService) {}

  async blacklist(token: string): Promise<void> {
    await this.prisma.tokenBlacklist.create({
      data: { token },
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }
}
