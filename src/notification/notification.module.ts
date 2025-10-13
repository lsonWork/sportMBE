import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';
import { NotificationController } from './notification.controller';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [NotificationService, NotificationGateway, JwtService],
  exports: [TypeOrmModule, NotificationGateway, NotificationService],
  controllers: [NotificationController], // để module khác dùng được
})
export class NotificationModule {}
