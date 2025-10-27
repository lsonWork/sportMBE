import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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
    const startDate = new Date(createAdvertisementDto.startDate);
    const endDate = new Date(createAdvertisementDto.endDate);

    if (startDate > endDate) {
      throw new HttpException(
        { message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    if (startDate < now) {
      throw new HttpException(
        { message: 'Ngày bắt đầu phải lớn hơn ngày hiện tại' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (endDate < now) {
      throw new HttpException(
        { message: 'Ngày kết thúc phải lớn hơn ngày hiện tại' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newAds = this.advertisementRepository.create({
      ...createAdvertisementDto,
      owner: { userId },
      status: true,
      createdAt: new Date(),
    });
    return await this.advertisementRepository.save(newAds);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: boolean,
  ) {
    const queryBuilder = this.advertisementRepository
      .createQueryBuilder('advertisement')
      .orderBy('advertisement.createdAt', 'DESC')
      .leftJoin('advertisement.owner', 'owner')
      .addSelect([
        'owner.userId',
        'owner.fullName',
        'owner.email',
        'owner.phoneNumber',
        'owner.avatarUrl',
      ]);
    if (search) {
      queryBuilder.andWhere('advertisement.title ILIKE :search', {
        search: `%${search}%`,
      });
    }
    if (status) {
      queryBuilder.andWhere('advertisement.status = :status', { status });
    }
    return await paginate<Advertisement>(queryBuilder, { page, limit });
  }

  async getAdsByOwnerId(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    if (!isUuid(userId)) {
      throw new HttpException(
        { message: 'Invalid user ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const queryBuilder = this.advertisementRepository
      .createQueryBuilder('advertisement')
      .orderBy('advertisement.status', 'DESC')
      .where('advertisement.owner.userId = :userId', { userId });
    if (search) {
      queryBuilder.andWhere('advertisement.title ILIKE :search', {
        search: `%${search}%`,
      });
    }
    return paginate<Advertisement>(queryBuilder, { page, limit });
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

  async getAdsByAdsId(advertisementId: string) {
    if (!isUuid(advertisementId)) {
      throw new HttpException(
        { message: 'Invalid advertisement ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.advertisementRepository.findOne({
      where: { advertisementId },
    });
    if (!result) {
      throw new HttpException(
        { message: 'Advertisement not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  async setOrderAdvertisement(advertisementId: string, order: string) {
    if (!isUuid(advertisementId)) {
      throw new HttpException(
        { message: 'Invalid advertisement ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const advertisement = await this.advertisementRepository.findOne({
      where: { advertisementId, status: true },
    });
    if (!advertisement) {
      throw new HttpException(
        { message: 'Advertisement not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    advertisement.displayOrder = order;
    return await this.advertisementRepository.save(advertisement);
  }

  async setHomeAdvertisement(advertisementId: string) {
    if (!isUuid(advertisementId)) {
      throw new HttpException(
        { message: 'Invalid advertisement ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const advertisement = await this.advertisementRepository.findOne({
      where: { advertisementId, status: true },
    });
    if (!advertisement) {
      throw new HttpException(
        { message: 'Advertisement not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    advertisement.displayHome = true;
    return await this.advertisementRepository.save(advertisement);
  }

  async recoveryAdvertisement(advertisementId: string) {
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
    advertisement.displayHome = false;
    advertisement.displayOrder = null;
    return await this.advertisementRepository.save(advertisement);
  }

  async deleteAdvertisement(advertisementId: string) {
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
    advertisement.status = false;
    return await this.advertisementRepository.save(advertisement);
  }

  async adsHome() {
    return this.advertisementRepository.find({
      where: {
        displayHome: true,
        status: true,
        startDate: LessThanOrEqual(new Date()),
        endDate: MoreThanOrEqual(new Date()),
      },
    });
  }

  async adsAdsPage(page: number, limit: number) {
    const queryBuilder = this.advertisementRepository
      .createQueryBuilder('advertisement')
      .where('advertisement.status = :status', { status: true })
      .andWhere('advertisement.startDate <= :now', { now: new Date() })
      .andWhere('advertisement.endDate >= :now', { now: new Date() })
      .orderBy(
        'CASE WHEN advertisement.displayOrder IS NULL THEN 1 ELSE 0 END',
        'ASC',
      )
      .addOrderBy('advertisement.displayOrder', 'ASC')
      .addOrderBy('advertisement.createdAt', 'DESC');
    return paginate<Advertisement>(queryBuilder, { page, limit });
  }
}
