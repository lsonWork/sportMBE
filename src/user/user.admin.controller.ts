// src/user/user.controller.ts
import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  UseGuards,
  Body,
  Patch,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from 'src/common/enum/Role';
import { Pagination } from 'nestjs-typeorm-paginate';
import { plainToClass } from 'class-transformer';
import { UserResponseDTO } from './DTO/UserDTO';
import { UpdateStatusDto } from './DTO/UpdateStatusDto';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UpdateOwnerPaymentInfoDto } from './DTO/UpdatePaymentInformationDto';
import { OwnerPaymentInfo } from './entities/owner-payment-info.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';

@Controller('admin/users')
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('access-token')
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    example: 'ADMIN/OWNER/CLIENT',
    description: 'Vai trò của người dùng',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('role') role?: Role,
    @Query('search') search?: string,
  ): Promise<Pagination<UserResponseDTO>> {
    limit = limit > 100 ? 100 : limit;
    const userPage = await this.userService.paginate(
      { page, limit },
      role,
      search,
    );
    const transformedItems = userPage.items.map((user) =>
      plainToClass(UserResponseDTO, user, {
        excludeExtraneousValues: true, // Rất quan trọng!
      }),
    );

    return new Pagination<UserResponseDTO>(transformedItems, userPage.meta);
  }

  @ApiBearerAuth('access-token')
  @Get(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async getStatus(@Param('id') id: string): Promise<{ status: boolean }> {
    const user = await this.userService.findOneById(id);
    return { status: user.status };
  }

  @ApiBearerAuth('access-token')
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
      },
    },
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<UserResponseDTO> {
    const user = await this.userService.updateStatus(
      id,
      updateStatusDto.status,
    );
    return plainToClass(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiBearerAuth('access-token')
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async updateToOwner(@Param('id') id: string): Promise<void> {
    return this.userService.updateClientToOwner(id);
  }

  @ApiBearerAuth('access-token')
  @Put('payment-info')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  async updatePaymentInfo(
    @GetUser() user: JwtUser,
    @Body() updatePaymentInfoDto: UpdateOwnerPaymentInfoDto,
  ): Promise<OwnerPaymentInfo> {
    return this.userService.upsertOwnerPaymentInfo(
      user.userId,
      updatePaymentInfoDto,
    );
  }
}
