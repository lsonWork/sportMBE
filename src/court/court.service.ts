/* eslint-disable */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Court } from './entities/court.entity';
import { DataSource, Repository } from 'typeorm';
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
import { CourtImage } from './entities/courtImage.entity';

@Injectable()
export class CourtService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(SportType)
    private sportTypeRepository: Repository<SportType>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CourtImage)
    private courtImageRepository: Repository<CourtImage>,
    private dataSource: DataSource,
  ) {}

  async createCourt(
    createCourtDto: CreateCourtRequestDto,
    ownerId: string,
  ): Promise<Court> {
    const owner = await this.userRepository.findOneBy({ userId: ownerId });
    if (!owner) {
      throw new HttpException(
        { message: 'Chủ sở hữu không tồn tại' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (owner.role !== Role.OWNER) {
      throw new HttpException(
        { message: 'Chỉ chủ sở hữu mới có thể tạo sân' },
        HttpStatus.FORBIDDEN,
      );
    }
    const sportType = await this.sportTypeRepository.findOneBy({
      sportTypeId: createCourtDto.sportType,
    });
    if (!sportType) {
      throw new HttpException(
        {
          message: `Không tìm thấy loại thể thao có id = "${createCourtDto.sportType}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const existingCourt = await this.courtRepository.findOneBy({
      courtName: createCourtDto.name,
      owner: { userId: ownerId },
    });
    if (existingCourt) {
      throw new HttpException(
        { message: 'Đã tồn tại sân có tên này' },
        HttpStatus.CONFLICT,
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newCourt = queryRunner.manager.create(Court, {
        courtName: createCourtDto.name,
        address: createCourtDto.address,
        description: createCourtDto.description,
        pricePerHour: createCourtDto.pricePerHour,
        subService: createCourtDto.subService,
        owner: owner,
        isActive: true,
        sportType: sportType,
        lat: createCourtDto.lat,
        lng: createCourtDto.lng,
      });
      const savedCourt = await queryRunner.manager.save(newCourt);
      const { imgUrls } = createCourtDto;
      if (imgUrls && imgUrls.length > 0) {
        const courtImagesToSave = imgUrls.map((url) => {
          return queryRunner.manager.create(CourtImage, {
            imageUrl: url,
            court: savedCourt,
          });
        });
        await queryRunner.manager.save(courtImagesToSave);
      }
      await queryRunner.commitTransaction();
      const foundCourt = await this.courtRepository.findOne({
        where: { courtId: savedCourt.courtId },
        relations: ['owner', 'sportType', 'courtImages'],
      });
      if (!foundCourt) {
        throw new HttpException(
          'Failed to re-fetch court after creation',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return foundCourt;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        { message: error.message || 'Error creating court' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateCourt(
    @Param() id: string,
    @Body() editCourtDto: EditCourtDto,
    userId: string,
  ): Promise<Court> {
    const owner = await this.userRepository.findOneBy({ userId });
    if (!owner) {
      throw new HttpException(
        { message: 'Current user not found.' },
        HttpStatus.NOT_FOUND,
      );
    }
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
    if (search) {
      queryBuilder.andWhere(
        '(court.courtName ILIKE :search OR court.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    return paginate<Court>(queryBuilder, options);
  }

  async deleteCourtDto(userId: string, courtId: string): Promise<void> {
    const owner = await this.userRepository.findOneBy({ userId });
    if (!owner) {
      throw new HttpException(
        { message: 'Current user not found.' },
        HttpStatus.NOT_FOUND,
      );
    }
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

    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      latitude: Number.parseFloat(String(r.lat)),
      longitude: Number.parseFloat(String(r.lng)),
      distance: Math.round(Number(r.distance)),
    }));
  }
  async findDetailById(courtId: string): Promise<Court> {
    const court = await this.courtRepository.findOne({
      where: { courtId: courtId },
      relations: ['owner', 'sportType', 'courtImages'],
    });
    if (!court) {
      throw new HttpException(
        `Court with ID "${courtId}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const ratingStats = await this.courtRepository
      .createQueryBuilder('court')
      .leftJoin('court.ratings', 'rating')
      .select('COALESCE(AVG(rating.star), 0)', 'avgRating')
      .where('court.courtId = :courtId', { courtId })
      .getRawOne();

    court.avgRating = parseFloat(ratingStats.avgRating);

    return court;
  }
}
