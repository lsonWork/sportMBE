import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  getMyFriend(
    @GetUser() user: JwtUser,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return this.friendService.getMyFriend(user.userId, page, limit, search);
  }

  @Delete(':id')
  deleteFriend(@GetUser() user: JwtUser, @Param('id') id: string) {
    return this.friendService.deleteFriend(user.userId, id);
  }

  @Get('available')
  getRequestableUser(@GetUser() user: JwtUser) {
    return this.friendService.getRequestableUser(user.userId);
  }
}
