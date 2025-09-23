import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './DTO/CreateAdvertisementDto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { RolesGuard } from 'src/common/guards/role.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/auth/public.decorator';
import { UpdateAdvertisementDto } from './DTO/UpdateAdvertisementDto';

@Controller('advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER, RoleEnum.ADMIN)
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
  @Roles(RoleEnum.ADMIN)
  @Get()
  @ApiQuery({
    name: 'page',
    required: true,
    type: Number,
    example: 1,
    description: 'Trang hiện tại',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
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
  @ApiQuery({
    name: 'status',
    required: false,
    type: Boolean,
    description: 'Trạng thái',
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: boolean,
  ) {
    return this.advertisementService.findAll(page, limit, search, status);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER, RoleEnum.ADMIN)
  @Get('me')
  @ApiQuery({
    name: 'page',
    required: true,
    type: Number,
    example: 1,
    description: 'Trang hiện tại',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
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
  findOne(
    @GetUser() user: JwtUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.advertisementService.getAdsByOwnerId(
      user.userId,
      page,
      limit,
      search,
    );
  }

  @Public()
  @Get(':userId/author')
  @ApiQuery({
    name: 'page',
    required: true,
    type: Number,
    example: 1,
    description: 'Trang hiện tại',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
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
  getOwnerAds(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.advertisementService.getAdsByOwnerId(
      userId,
      page,
      limit,
      search,
    );
  }

  @Public()
  @Get('home')
  adsHome() {
    return this.advertisementService.adsHome();
  }

  @Public()
  @Get('ads-page')
  adsAdsPage(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.advertisementService.adsAdsPage(page, limit);
  }

  @Public()
  @Get(':id')
  findOneAd(@Param('id') advertisementId: string) {
    return this.advertisementService.getAdsByAdsId(advertisementId);
  }

  @ApiBearerAuth('access-token')
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
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER, RoleEnum.ADMIN)
  @Patch(':advertisementId')
  updateAdvertisement(
    @Param('advertisementId') advertisementId: string,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
  ) {
    return this.advertisementService.updateAdvertisement(
      advertisementId,
      updateAdvertisementDto,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Patch(':advertisementId/priority')
  @ApiQuery({
    name: 'order',
    required: true,
    type: String,
    example: '1',
  })
  setOrderAdvertisement(
    @Param('advertisementId') advertisementId: string,
    @Query('order') order: string,
  ) {
    return this.advertisementService.setOrderAdvertisement(
      advertisementId,
      order,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Patch(':advertisementId/home')
  setHomeAdvertisement(@Param('advertisementId') advertisementId: string) {
    return this.advertisementService.setHomeAdvertisement(advertisementId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Patch(':advertisementId/recover')
  recoveryAdvertisement(@Param('advertisementId') advertisementId: string) {
    return this.advertisementService.recoveryAdvertisement(advertisementId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.OWNER)
  @Delete(':advertisementId')
  deleteAdvertisement(@Param('advertisementId') advertisementId: string) {
    return this.advertisementService.deleteAdvertisement(advertisementId);
  }
}
