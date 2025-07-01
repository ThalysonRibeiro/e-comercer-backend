import { IsString } from 'class-validator';

export class CreateInstitutionalLinkDto {
  @IsString()
  siteContentId: string;

  @IsString()
  name: string;

  @IsString()
  link: string;
}
