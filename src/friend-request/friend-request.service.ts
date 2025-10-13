import { HttpException, Injectable } from '@nestjs/common';
import { CreateFriendRequestDTO } from './DTO/CreateFriendRequestDTO';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friendRequest.entity';
import { DataSource, Repository } from 'typeorm';
import { validate as isUuid } from 'uuid';
import { UpdateFriendRequestDto } from './DTO/UpdateFriendRequestDto';
import { paginate } from 'nestjs-typeorm-paginate';
import { NotificationType } from 'src/common/enum/NotificationType';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    private readonly dataSource: DataSource,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  async createFriendRequest(
    fromId: string,
    fullName: string,
    createFriendRequestDTO: CreateFriendRequestDTO,
  ) {
    const { toId } = createFriendRequestDTO;

    if (!isUuid(toId)) {
      throw new HttpException('Invalid toId', 400);
    }

    const existRequest = await this.friendRequestRepository.findOneBy({
      fromId,
      toId,
    });

    if (existRequest && !existRequest?.status) {
      throw new HttpException('Lời mời kết bạn đã tồn tại', 400);
    }

    if (existRequest && existRequest?.status) {
      throw new HttpException('Hai bạn đã là bạn bè', 400);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const author = await queryRunner.manager.findOneBy(User, {
        userId: fromId,
      });
      const newRequest = queryRunner.manager.create(FriendRequest, {
        fromId,
        toId,
        status: false,
        createdAt: new Date(),
      });
      await queryRunner.manager.save(newRequest);

      const newNoti = queryRunner.manager.create(Notification, {
        content: `Lời mời kết bạn mới từ ${fullName}`,
        createdAt: new Date(),
        userId: toId,
        type: NotificationType.FRIEND_REQUEST,
      });

      await queryRunner.manager.save(newNoti);
      await queryRunner.commitTransaction();

      this.notificationGateway.emitEvent(
        toId,
        {
          id: newNoti.notificationId,
          type: NotificationType.FRIEND_REQUEST,
          message: `${newNoti.content}`,
          actor: {
            id: fromId,
            name: fullName,
            avatar: author?.avatarUrl,
          },
          createdAt: newNoti.createdAt.toISOString(),
        },
        NotificationType.FRIEND_REQUEST,
      );
      return newRequest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getFriendRequest(
    userId: string,
    type: string,
    page: number,
    limit: number,
  ) {
    const query =
      this.friendRequestRepository.createQueryBuilder('friendRequest');

    if (type === 'sent') {
      query
        .where('friendRequest.fromId = :userId', { userId })
        .andWhere('friendRequest.status = :status', { status: false })
        .leftJoinAndSelect('friendRequest.to', 'user'); // join đến người nhận
    } else {
      query
        .where('friendRequest.toId = :userId', { userId })
        .andWhere('friendRequest.status = :status', { status: false })
        .leftJoinAndSelect('friendRequest.from', 'user'); // join đến người gửi
    }

    return paginate<FriendRequest>(query, { page, limit });
  }

  async updateFriendRequest(
    userId: string,
    fullName: string,
    id: string,
    updateFriendRequestDto: UpdateFriendRequestDto,
  ) {
    const { status } = updateFriendRequestDto;
    const request = await this.friendRequestRepository.findOneBy({
      friendRequestId: id,
      toId: userId,
    });
    if (!request) {
      throw new HttpException('Friend request not found', 404);
    }
    if (status === false) {
      return await this.friendRequestRepository.remove(request);
    } else {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        request.status = status;
        await queryRunner.manager.save(request);

        const author = await queryRunner.manager.findOneBy(User, {
          userId: request.fromId,
        });

        const newNoti = queryRunner.manager.create(Notification, {
          content: `${fullName} đã chấp nhận lời mời kết bạn`,
          createdAt: new Date(),
          userId: request.fromId,
          type: NotificationType.FRIEND_ACCEPTED,
        });
        await queryRunner.manager.save(newNoti);
        await queryRunner.commitTransaction();

        this.notificationGateway.emitEvent(
          request.fromId,
          {
            id: newNoti.notificationId,
            type: NotificationType.FRIEND_ACCEPTED,
            message: `${newNoti.content}`,
            actor: {
              id: author?.userId,
              name: author?.fullName,
              avatar: author?.avatarUrl,
            },
            createdAt: newNoti.createdAt.toISOString(),
          },
          NotificationType.FRIEND_ACCEPTED,
        );
        console.log({
          id: newNoti.notificationId,
          type: NotificationType.FRIEND_ACCEPTED,
          message: `${newNoti.content}`,
          actor: {
            id: author?.userId,
            name: author?.fullName,
            avatar: author?.avatarUrl,
          },
          createdAt: newNoti.createdAt.toISOString(),
        });

        return request;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }
}
