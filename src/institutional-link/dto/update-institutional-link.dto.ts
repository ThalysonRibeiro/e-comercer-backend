import { PartialType } from '@nestjs/mapped-types';
import { CreateInstitutionalLinkDto } from './create-institutional-link.dto';

export class UpdateInstitutionalLinkDto extends PartialType(
  CreateInstitutionalLinkDto,
) {}
