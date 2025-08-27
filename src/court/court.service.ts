import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Court } from './entities/court.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourtRequestDto } from './DTO/createCourtRequestDto';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/common/enum/Role';
import { SportType } from 'src/sport-type/entities/sportType.entity';

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
      where: { typeName: createCourtDto.sportType },
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
}
