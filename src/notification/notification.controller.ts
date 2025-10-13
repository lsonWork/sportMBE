import { Controller, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiBearerAuth('access-token')
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
  getNotification(
    @GetUser() user: JwtUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.notificationService.getNotification(user.userId, page, limit);
  }
}
