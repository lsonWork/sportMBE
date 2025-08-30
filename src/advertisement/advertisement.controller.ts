import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './DTO/CreateAdvertisementDto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
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
}
