import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friendRequest.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  providers: [FriendRequestService],
  controllers: [FriendRequestController],
  imports: [TypeOrmModule.forFeature([FriendRequest]), NotificationModule],
})
export class FriendRequestModule {}
