import {
  Controller,
  Body,
  Patch,
  UseGuards,
  Request,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('complete-profile')
  async completeProfile(
    @Request() req,
    @Body()
    profileData: {
      name: string;
      cpf_or_cnpj: string;
      genero: string;
      dateOfBirth: string;
      phone: string;
    },
  ) {
    const userId = req.user.id;
    const updatedUser = await this.usersService.completeProfile(
      userId,
      profileData,
    );

    return {
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        // type: updatedUser.type,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('avatar')
  async uploadAvatar(
    @Request() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png|webp/g,
        })
        .addMaxSizeValidator({
          maxSize: 6 * (1024 * 1024), //= 6MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatarImage(req, file);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('avatar-Cloudnary')
  async uploadAvatarCloudnary(
    @Request() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png|webp/g,
        })
        .addMaxSizeValidator({
          maxSize: 6 * (1024 * 1024), // 6MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatarCloudnary(req, file);
  }
}
