import { PartialType } from '@nestjs/mapped-types';
import { CreateSiteContentDto } from './create-site-content.dto';

export class UpdateSiteContentDto extends PartialType(CreateSiteContentDto) {}
