import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationType } from 'src/common/enum/NotificationType';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createNotification(notification: Notification) {
    return this.notificationRepository.save(notification);
  }

  async getNotification(userId: string, page: number = 1, limit: number = 5) {
    const startIndex = (page - 1) * limit;
    // const endIndex = startIndex + limit;

    const rawNoti = await this.notificationRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: startIndex,
    });

    const totalItems = await this.notificationRepository.count({
      where: { userId },
    });

    const noti = await Promise.all(
      rawNoti.map(async (item: Notification) => {
        const actor = await this.userRepository.findOne({
          where: { userId: item.userId },
        });

        if (!actor) {
          throw new HttpException('User not found', 404);
        }

        switch (item.type) {
          case NotificationType.BOOKING_SUCCESS:
            return {
              id: item.notificationId,
              type: item.type,
              message: item.content,
              actor: {
                id: actor.userId,
                name: actor.fullName,
              },
              createdAt: item.createdAt,
            };
          case NotificationType.INVITED_TO_BOOKING:
            return {
              id: item.notificationId,
              type: item.type,
              message: item.content,
              actor: {
                id: actor.userId,
                name: actor.fullName,
                avatar: actor.avatarUrl,
              },
              createdAt: item.createdAt,
            };
          case NotificationType.NEW_BOOKING_FOR_OWNER:
            return {
              id: item.notificationId,
              type: item.type,
              message: item.content,
              actor: {
                id: actor.userId,
                name: actor.fullName,
              },
              createdAt: item.createdAt,
            };
          case NotificationType.FRIEND_REQUEST:
            return {
              id: item.notificationId,
              type: item.type,
              message: item.content,
              actor: {
                id: actor.userId,
                name: actor.fullName,
                avatar: actor.avatarUrl,
              },
              createdAt: item.createdAt,
            };
          case NotificationType.FRIEND_ACCEPTED:
            return {
              id: item.notificationId,
              type: item.type,
              message: item.content,
              actor: {
                id: actor.userId,
                name: actor.fullName,
                avatar: actor.avatarUrl,
              },
              createdAt: item.createdAt,
            };
          case NotificationType.BOOKING_REMINDER:
            return {
              id: item.notificationId,
              type: item.type,
              message: item.content,
              actor: {
                id: actor.userId,
                name: actor.fullName,
              },
              createdAt: item.createdAt,
            };

          default:
            return item;
        }
      }),
    );

    return {
      data: noti,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
}
