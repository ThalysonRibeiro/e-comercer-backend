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
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Patch('update-profile/:id')
  async updateProfileUser(
    @Param('id') id: string,
    @Body()
    profileData: UpdateUserDto
  ) {
    return await this.usersService.updateUser(
      id,
      profileData,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.useradmin, AccountType.usermoderator)
  @Patch('update-profile-admin/:id')
  async updateProfileAdmin(
    @Param('id') id: string,
    @Body()
    profileData: UpdateUserDto
  ) {
    return await this.usersService.updateUser(
      id,
      profileData,
    );
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

  @Roles(AccountType.useradmin)
  @Get('admin/:id')
  async findUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Roles(AccountType.useradmin)
  @Get('admin')
  allUsers() {
    return this.usersService.allUsers();
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
