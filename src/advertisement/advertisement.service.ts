import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { Repository } from 'typeorm';
import { CreateAdvertisementDto } from './DTO/CreateAdvertisementDto';
import { paginate } from 'nestjs-typeorm-paginate';
import { validate as isUuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
  ) {}
  async createAdvertisement(
    userId: string,
    createAdvertisementDto: CreateAdvertisementDto,
  ) {
    const newAds = this.advertisementRepository.create({
      ...createAdvertisementDto,
      owner: { userId },
      status: true,
    });
    return this.advertisementRepository.save(newAds);
  }

  async findAll(page: number, limit: number, search?: string) {
    const queryBuilder =
      this.advertisementRepository.createQueryBuilder('advertisement');
    if (search) {
      queryBuilder.andWhere('advertisement.title ILIKE :search', {
        search: `%${search}%`,
      });
    }
    return paginate<Advertisement>(queryBuilder, { page, limit });
  }

  async getAdsByOwnerId(userId: string) {
    if (!isUuid(userId)) {
      throw new HttpException(
        { message: 'Invalid user ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.advertisementRepository.find({
      where: { owner: { userId } },
    });
    return result;
  }
}
