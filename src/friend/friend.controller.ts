import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';

@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(RoleEnum.CLIENT)
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  getMyFriend(
    @GetUser() user: JwtUser,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return this.friendService.getMyFriend(user.userId, page, limit, search);
  }
}
