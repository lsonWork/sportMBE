import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { Repository } from 'typeorm';
import { CreateAdvertisementDto } from './DTO/CreateAdvertisementDto';

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
}
