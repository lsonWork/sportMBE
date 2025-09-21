import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from 'src/friend-request/entities/friendRequest.entity';
import { Repository } from 'typeorm';
import { FriendDTO } from './DTO/FriendDTO';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRepository: Repository<FriendRequest>,
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
      .orderBy('u.userId', 'ASC') // Thêm orderBy để pagination ổn định
      .offset((page - 1) * limit) // Thay skip để rõ ràng hơn
      .limit(limit); // Thay take để rõ ràng hơn

    if (search) {
      dataQuery.andWhere('u.fullName ILIKE :search', { search: `%${search}%` });
    }

    const friends: FriendDTO[] = await dataQuery.getRawMany();

    const totalPages = Math.ceil(totalItems / limit);

    return { friends, totalItems, totalPages };
  }
}
