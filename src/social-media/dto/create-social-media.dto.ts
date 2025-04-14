import { IsString } from 'class-validator';

export class CreateSocialMediaDto {
  @IsString()
  siteContentId: string;

  @IsString()
  name: string;

  @IsString()
  link: string;
}
