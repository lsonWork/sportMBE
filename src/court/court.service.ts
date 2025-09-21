/* eslint-disable */
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
import { DeleteCourtDto } from './DTO/deleteCourtDto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { haversineDistance } from 'src/utils/haversineDistance';
import { NearByCourt } from './interface/NearByCourt';
import { NearByCourtRaw } from './interface/NearByCourtRaw';

@Injectable()
export class CourtService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(SportType)
    private sportTypeRepository: Repository<SportType>,
  ) {}

  // async createCourt(
  //   createCourtDto: CreateCourtRequestDto,
  //   owner: User,
  // ): Promise<Court> {
  //   if (owner.role !== Role.OWNER) {
  //     throw new HttpException(
  //       { message: 'Only owners can create courts' },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   const sportType = await this.sportTypeRepository.findOne({
  //     where: { sportTypeId: createCourtDto.sportType },
  //   });
  //   if (!sportType) {
  //     throw new HttpException(
  //       { message: 'Sport type not found' },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const newCourt = this.courtRepository.create({
  //     courtName: createCourtDto.name,
  //     address: createCourtDto.address,
  //     description: createCourtDto.description,
  //     pricePerHour: createCourtDto.pricePerHour,
  //     subService: createCourtDto.subService,
  //     owner: owner,
  //     isActive: true,
  //     sportType: sportType,
  //     lat: createCourtDto.lat,
  //     lng: createCourtDto.lng,
  //   });
  //   try {
  //     const result = await this.courtRepository.save(newCourt);
  //     return result;
  //   } catch (error) {
  //     const err = error as Error;
  //     throw new HttpException(
  //       { message: err.message || 'Error creating court' },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

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

  async paginateForOwner(
    ownerId: string,
    options: IPaginationOptions,
    sportTypeId?: string,
    search?: string,
  ): Promise<Pagination<Court>> {
    const queryBuilder = this.courtRepository.createQueryBuilder('court');

    queryBuilder
      .leftJoinAndSelect('court.sportType', 'sportType')
      .leftJoinAndSelect('court.courtImages', 'courtImages')
      .where('court.ownerId = :ownerId', { ownerId })
      .orderBy('court.courtName', 'ASC');

    if (sportTypeId) {
      queryBuilder.andWhere('sportType.sportTypeId = :sportTypeId', {
        sportTypeId,
      });
    }

    // Thêm điều kiện tìm kiếm nếu có chuỗi search
    if (search) {
      queryBuilder.andWhere(
        '(court.courtName ILIKE :search OR court.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    // Trả về kết quả đã phân trang
    return paginate<Court>(queryBuilder, options);
  }

  async deleteCourtDto(owner: User, courtId: string): Promise<void> {
    const court = await this.courtRepository.findOne({
      where: { courtId: courtId },
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
        { message: 'You do not have permission to delete this court' },
        HttpStatus.FORBIDDEN,
      );
    }
    if (court.isActive) {
      court.isActive = false;
    } else {
      court.isActive = true;
    }
    try {
      await this.courtRepository.save(court);
    } catch (error) {
      throw new HttpException(
        { message: 'Error deleting court' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findNearBy(lat: number, lng: number): Promise<NearByCourt[]> {
    const radius = Number(process.env.LIMIT_RADIUS_NEARBY) || 10000;

    const degLat = radius / 111320;
    const degLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - degLat;
    const maxLat = lat + degLat;
    const minLng = lng - degLng;
    const maxLng = lng + degLng;

    // SQL an toàn: tính distance trong subquery (có cast sang double precision để tránh lỗi khi c.lat/c.lng là text)
    const sql = `
      SELECT q."courtId" AS id, q."courtName" AS name, q.lat AS lat, q.lng AS lng, q.distance AS distance
      FROM (
        SELECT c."courtId", c."courtName", c.lat, c.lng,
          (
            6371000 * 2 * asin(
              sqrt(
                pow(sin(radians(CAST(c.lat AS double precision) - $1) / 2), 2) +
                cos(radians($1)) * cos(radians(CAST(c.lat AS double precision))) *
                pow(sin(radians(CAST(c.lng AS double precision) - $2) / 2), 2)
              )
            )
          ) AS distance
        FROM "court" c
        WHERE CAST(c.lat AS double precision) BETWEEN $3 AND $4
          AND CAST(c.lng AS double precision) BETWEEN $5 AND $6
      ) q
      WHERE q.distance <= $7
      ORDER BY q.distance ASC;
    `;

    const params = [lat, lng, minLat, maxLat, minLng, maxLng, radius];

    const rows: Array<{
      id: string;
      name: string;
      lat: string | number;
      lng: string | number;
      distance: number;
    }> = await this.courtRepository.query(sql, params);

    // map và parse về number cho chắc
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      latitude: Number.parseFloat(String(r.lat)),
      longitude: Number.parseFloat(String(r.lng)),
      distance: Math.round(Number(r.distance)),
    }));
  }
}
