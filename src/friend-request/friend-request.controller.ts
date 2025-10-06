import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { CreateFriendRequestDTO } from './DTO/CreateFriendRequestDTO';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { UpdateFriendRequestDto } from './DTO/UpdateFriendRequestDto';

@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(RoleEnum.CLIENT)
@Controller('friend-request')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        toId: { type: 'string' },
      },
    },
  })
  createFriendRequest(
    @GetUser() user: JwtUser,
    @Body() createFriendRequestDTO: CreateFriendRequestDTO,
  ) {
    const result = this.friendRequestService.createFriendRequest(
      user.userId,
      user.fullName,
      createFriendRequestDTO,
    );
    return result;
  }

  @Get()
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ['sent', 'received'],
  })
  getFriendRequest(
    @GetUser() user: JwtUser,
    @Query('type') type: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.friendRequestService.getFriendRequest(
      user.userId,
      type,
      page,
      limit,
    );
  }

  @Patch(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
      },
    },
  })
  updateFriendRequest(
    @GetUser() user: JwtUser,
    @Param('id') id: string,
    @Body() updateFriendRequestDto: UpdateFriendRequestDto,
  ) {
    return this.friendRequestService.updateFriendRequest(
      user.userId,
      id,
      updateFriendRequestDto,
    );
  }
}
