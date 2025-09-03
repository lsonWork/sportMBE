import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './DTO/CreateAdvertisementDto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { RolesGuard } from 'src/common/guards/role.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';

@Controller('advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        imageUrl: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  @Post()
  createAdvertisement(
    @GetUser() user: JwtUser,
    @Body() createAdvertisementDto: CreateAdvertisementDto,
  ) {
    return this.advertisementService.createAdvertisement(
      user.userId,
      createAdvertisementDto,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Trang hiện tại',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Số item mỗi trang',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.advertisementService.findAll(page, limit, search);
  }
}
