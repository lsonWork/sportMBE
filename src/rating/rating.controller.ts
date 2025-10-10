import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { CreateRatingDto } from './DTO/CreateRatingDto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';

@Controller('rating')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(RoleEnum.CLIENT)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        courtId: { type: 'string' },
        star: { type: 'number' },
        content: { type: 'string' },
      },
    },
  })
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @GetUser() user: JwtUser,
  ) {
    return this.ratingService.createRating(createRatingDto, user.userId);
  }

  @Get(':courtId')
  @ApiQuery({ name: 'page', required: true })
  @ApiQuery({ name: 'limit', required: true })
  async getRating(
    @Param('courtId') courtId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.ratingService.getRating(courtId, page, limit);
  }

  @Delete(':ratingId')
  async deleteRating(@Param('ratingId') ratingId: string) {
    return this.ratingService.deleteRating(ratingId);
  }
}
