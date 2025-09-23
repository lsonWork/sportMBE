import { HttpException, Injectable } from '@nestjs/common';
import { CreateFriendRequestDTO } from './DTO/CreateFriendRequestDTO';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friendRequest.entity';
import { Repository } from 'typeorm';
import { validate as isUuid } from 'uuid';
import { UpdateFriendRequestDto } from './DTO/UpdateFriendRequestDto';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
  ) {}
  async createFriendRequest(
    fromId: string,
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

    if (!existRequest?.status) {
      throw new HttpException('Lời mời kết bạn đã tồn tại', 400);
    }

    if (existRequest?.status) {
      throw new HttpException('Hai bạn đã là bạn bè', 400);
    }

    const newRequest = this.friendRequestRepository.create({
      fromId,
      toId,
      status: false,
      createdAt: new Date(),
    });

    return await this.friendRequestRepository.save(newRequest);
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
      request.status = status;
    }
    return await this.friendRequestRepository.save(request);
  }
}
