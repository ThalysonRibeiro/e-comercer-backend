import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccountType } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Get('user/:id')
  findAllReviewUser(@Param('id') id: string) {
    return this.reviewService.findAllReviewUser(id);
  }

  @Public()
  @Get('product/:id')
  findAllReviewProduct(@Param('id') id: string) {
    return this.reviewService.findAllReviewProduct(id);
  }

  @Public()
  @Get()
  findAllReview() {
    return this.reviewService.findAllReview();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Roles(AccountType.useradmin)
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
