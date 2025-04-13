import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValideteZipService } from 'src/validete-zip/validete-zip.service';

@Module({
  controllers: [AddressController],
  providers: [AddressService, PrismaService, ValideteZipService],
})
export class AddressModule {}
