import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSportTypeDto } from './DTO/CreateSportTypeDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportType } from './entities/sportType.entity';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { EditSportTypeDto } from './DTO/EditSportTypeDto';
import { validate as isUuid } from 'uuid';

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

  async editSportType(id: string, editSportTypeDto: EditSportTypeDto) {
    if (!isUuid(id)) {
      throw new HttpException(
        { message: 'Invalid sport type ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const editSportTypeObj = await this.sportTypeRepository.findOneBy({
      sportTypeId: id,
    });
    console.log(editSportTypeObj);
    if (!editSportTypeObj) {
      throw new HttpException(
        { message: 'Sport type not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const { name } = editSportTypeDto;
    if (name) {
      editSportTypeObj.typeName = name;
    }
    try {
      const result = await this.sportTypeRepository.save(editSportTypeObj);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error editing sport type' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
