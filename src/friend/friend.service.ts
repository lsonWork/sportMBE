import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';
import { Repository } from 'typeorm';
import { FriendDTO } from './DTO/FriendDTO';
import { validate as isUuid } from 'uuid';
import { User } from 'src/user/entities/user.entity';
import { shuffleArray } from 'src/utils/shuffleArray';
import { RequestableUser } from './interface/RequestableUser';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRepository: Repository<FriendRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async getMyFriend(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ friends: FriendDTO[]; totalItems: number; totalPages: number }> {
    // Query để đếm tổng số friend
    const countQuery = this.friendRepository
      .createQueryBuilder('friend')
      .where('friend.status = true')
      .andWhere(':userId IN (friend.fromId, friend.toId)', { userId });

    const totalItems = await countQuery.getCount();

    // Query để lấy dữ liệu phân trang
    const dataQuery = this.friendRepository
      .createQueryBuilder('friend')
      .innerJoin(
        'user',
        'u',
        'u.userId = CASE WHEN friend.fromId = :userId THEN friend.toId ELSE friend.fromId END',
        { userId },
      )
      .select(`DISTINCT u."userId", u."fullName", u."avatarUrl"`)
      .where('friend.status = true')
      .andWhere(':userId IN (friend.fromId, friend.toId)', { userId })
      .orderBy('u.fullName', 'ASC') // Thêm orderBy để pagination ổn định
      .offset((page - 1) * limit) // Thay skip để rõ ràng hơn
      .limit(limit); // Thay take để rõ ràng hơn

    if (search) {
      dataQuery.andWhere('u.fullName ILIKE :search', { search: `%${search}%` });
    }

    const friends: FriendDTO[] = await dataQuery.getRawMany();

    const totalPages = Math.ceil(totalItems / limit);

    return { friends, totalItems, totalPages };
  }

  async deleteFriend(userId: string, friendId: string) {
    if (!isUuid(friendId)) {
      throw new HttpException('Invalid friend ID', 400);
    }
    const friend = await this.friendRepository.findOne({
      where: [
        {
          fromId: userId,
          toId: friendId,
        },
        {
          fromId: friendId,
          toId: userId,
        },
      ],
    });
    if (!friend) {
      throw new HttpException('Friend not found', 404);
    }
    return await this.friendRepository.remove(friend);
  }

  async getRequestableUser(currentUserId: string): Promise<RequestableUser[]> {
    const listUser = await this.userRepository.query<RequestableUser[]>(
      `
      SELECT u."userId", u."fullName", u."avatarUrl", u."bio", u."birthDate", u."gender"
      FROM "user" u
      WHERE u."userId" != $1
        AND u."role" = 'CLIENT'
        AND u."userId" NOT IN (
          SELECT "fromId" FROM "friend_request" WHERE "toId" = $1
          UNION
          SELECT "toId" FROM "friend_request" WHERE "fromId" = $1
        )
      `,
      [currentUserId],
    );

    console.log(listUser);

    const result = shuffleArray<RequestableUser>(listUser);
    const redisInstance = this.redisService.getClient();
    console.log('ID HIỆN TẠI: ', currentUserId);
    const key = `requestable-user:${currentUserId}`;

    await redisInstance.del(key);

    if (result.length > 0) {
      await redisInstance.rpush(
        key,
        ...result.map((user) => JSON.stringify(user)),
      );
    }

    return result;
  }

  async getOneUser(currentUserId: string) {
    const redis = this.redisService.getClient();
    const key = `requestable-user:${currentUserId}`;

    const rawUsers = await redis.lrange(key, 0, 3);

    if (!rawUsers || rawUsers.length === 0) {
      return [];
    }

    await redis.ltrim(key, rawUsers.length, -1);

    const users = rawUsers.map((u) => JSON.parse(u) as RequestableUser);
    return users;
  }
}
