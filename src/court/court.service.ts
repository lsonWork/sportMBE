import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Court } from './entities/court.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourtRequestDto } from './DTO/createCourtRequestDto';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/common/enum/Role';
import { SportType } from 'src/sport-type/entities/sportType.entity';
import { Param, ParseUUIDPipe } from '@nestjs/common';
import { Body, Request } from '@nestjs/common';
import { EditCourtDto } from './DTO/editCourtDto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class CourtService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(SportType)
    private sportTypeRepository: Repository<SportType>,
  ) {}

  async createCourt(
    createCourtDto: CreateCourtRequestDto,
    owner: User,
  ): Promise<Court> {
    if (owner.role !== Role.OWNER) {
      throw new HttpException(
        { message: 'Only owners can create courts' },
        HttpStatus.FORBIDDEN,
      );
    }
    const sportType = await this.sportTypeRepository.findOne({
      where: { sportTypeId: createCourtDto.sportType },
    });
    if (!sportType) {
      throw new HttpException(
        { message: 'Sport type not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const newCourt = this.courtRepository.create({
      courtName: createCourtDto.name,
      address: createCourtDto.address,
      description: createCourtDto.description,
      pricePerHour: createCourtDto.pricePerHour,
      subService: createCourtDto.subService,
      owner: owner,
      isActive: true,
      sportType: sportType,
    });
    try {
      const result = await this.courtRepository.save(newCourt);
      return result;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error creating court' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCourt(
    @Param() id: string,
    @Body() editCourtDto: EditCourtDto,
    owner: User,
  ): Promise<Court> {
    const court = await this.courtRepository.findOne({
      where: { courtId: id },
      relations: ['owner'],
    });
    if (!court) {
      throw new HttpException(
        { message: 'Court not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (court.owner.userId !== owner.userId) {
      throw new HttpException(
        { message: 'You do not have permission to edit this court' },
        HttpStatus.FORBIDDEN,
      );
    }
    const { sportType: sportTypeId, ...restOfDto } = editCourtDto;
    this.courtRepository.merge(court, restOfDto);
    try {
      const result = await this.courtRepository.save(court);
      return result;
    } catch (error) {
      throw new HttpException(
        { message: 'Error updating court' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async paginate(
    options: IPaginationOptions,
    sportTypeId?: string,
    search?: string,
  ): Promise<Pagination<Court>> {
    const queryBuilder = this.courtRepository.createQueryBuilder('court');

    queryBuilder
      .leftJoinAndSelect('court.sportType', 'sportType') // JOIN và SELECT dữ liệu từ SportType
      .leftJoinAndSelect('court.courtImages', 'courtImages') // JOIN và SELECT dữ liệu từ CourtImage
      .orderBy('court.courtName', 'ASC');

    if (sportTypeId) {
      queryBuilder.andWhere('sportType.sportTypeId = :sportTypeId', {
        sportTypeId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(court.courtName ILIKE :search OR court.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    queryBuilder.groupBy(
      'court.courtId, sportType.sportTypeId, courtImages.imageId',
    );
    return paginate<Court>(queryBuilder, options);
  }
}
