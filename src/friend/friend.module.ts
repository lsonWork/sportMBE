import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [TypeOrmModule.forFeature([FriendRequest, User])],
})
export class FriendModule {}
