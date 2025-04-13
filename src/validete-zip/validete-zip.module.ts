import { Module } from '@nestjs/common';
import { ValideteZipService } from './validete-zip.service';
import { ValideteZipController } from './validete-zip.controller';

@Module({
  providers: [ValideteZipService],
  controllers: [ValideteZipController],
})
export class ValideteZipModule {}
