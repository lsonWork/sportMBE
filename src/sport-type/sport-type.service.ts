import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSportTypeDto } from './DTO/CreateSportTypeDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportType } from './entities/sportType.entity';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class SportTypeService {
  constructor(
    @InjectRepository(SportType)
    private readonly sportTypeRepository: Repository<SportType>,
  ) {}

  async createSportType(createSportTypeDto: CreateSportTypeDto) {
    const { name } = createSportTypeDto;
    const newSportType = this.sportTypeRepository.create({
      typeName: name,
      status: true,
    });
    try {
      const result = await this.sportTypeRepository.save(newSportType);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error creating sport type' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSportType(
    page: number,
    limit: number,
    search?: string,
  ): Promise<Pagination<SportType>> {
    const queryBuilder =
      this.sportTypeRepository.createQueryBuilder('sportType');
    if (search) {
      queryBuilder.andWhere('sportType.typeName ILIKE :search', {
        search: `%${search}%`,
      });
    }
    return paginate<SportType>(queryBuilder, { page, limit });
  }
}
