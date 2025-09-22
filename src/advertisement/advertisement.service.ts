import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { Repository } from 'typeorm';
import { CreateAdvertisementDto } from './DTO/CreateAdvertisementDto';
import { paginate } from 'nestjs-typeorm-paginate';
import { validate as isUuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateAdvertisementDto } from './DTO/UpdateAdvertisementDto';

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
      createdAt: new Date(),
    });
    return await this.advertisementRepository.save(newAds);
  }

  async findAll(page: number, limit: number, search?: string) {
    const queryBuilder = this.advertisementRepository
      .createQueryBuilder('advertisement')
      .orderBy('advertisement.createdAt', 'DESC');
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

  async updateAdvertisement(
    advertisementId: string,
    updateAdvertisementDto: UpdateAdvertisementDto,
  ) {
    if (!isUuid(advertisementId)) {
      throw new HttpException(
        { message: 'Invalid advertisement ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const advertisement = await this.advertisementRepository.findOne({
      where: { advertisementId },
    });
    if (!advertisement) {
      throw new HttpException(
        { message: 'Advertisement not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.advertisementRepository.save({
      ...advertisement,
      ...updateAdvertisementDto,
    });
  }
}
