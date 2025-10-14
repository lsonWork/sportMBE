import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CourtService } from './court.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { DashboardRequestDTO } from './DTO/DashbroadRequestDTO';
@Controller('owner')
export class OwnerController {
  constructor(private readonly courtService: CourtService) {}

  @ApiBearerAuth('access-token')
  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  async getDashboard(
    @GetUser() user: JwtUser,
    @Query() dashboardRequestDTO: DashboardRequestDTO,
  ) {
    return this.courtService.getOwnerDashboard(
      user.userId,
      dashboardRequestDTO,
    );
  }
}
