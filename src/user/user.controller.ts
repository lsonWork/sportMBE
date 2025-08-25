// src/user/user.controller.ts
import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  Request,
  HttpStatus,
  HttpException,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
// import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/common/enum/Role';
// import { RolesGuard } from 'src/auth/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { plainToClass } from 'class-transformer';
import { UserResponseDTO } from './DTO/UserDTO';
import { AuthGuard } from '@nestjs/passport';
import { UpdateStatusDto } from './DTO/UpdateStatusDto';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { ApiBody } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  //   @Roles(Role.ADMIN) // Chỉ định vai trò được phép
  //   @UseGuards(RolesGuard) // Kích hoạt Guard kiểm tra vai trò
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

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<UserResponseDTO> {
    const user = await this.userService.findOneById(id);
    const loggedInUser = req.user;
    if (
      loggedInUser.role !== Role.ADMIN &&
      loggedInUser.userId !== user.userId
    ) {
      throw new HttpException({ message: 'Forbidden' }, HttpStatus.FORBIDDEN);
    }
    return plainToClass(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async getStatus(@Param('id') id: string): Promise<{ status: boolean }> {
    const user = await this.userService.findOneById(id);
    return { status: user.status };
  }

  @Post(':id/status')
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
}
