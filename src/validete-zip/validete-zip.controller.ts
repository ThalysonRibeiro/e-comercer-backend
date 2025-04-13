import { Controller, Get, Param } from '@nestjs/common';
import { ValideteZipService } from './validete-zip.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('validete-zip')
export class ValideteZipController {
  constructor(private readonly valideteZipService: ValideteZipService) {}

  @Public()
  @Get(':zip')
  ValideteZip(@Param('zip') zip: string) {
    return this.valideteZipService.validateZip(zip);
  }
}
