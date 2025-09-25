import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { DataSource, Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { CreateRatingDto } from './DTO/CreateRatingDto';
import { validate as isUuid } from 'uuid';
import { paginate } from 'nestjs-typeorm-paginate';
import { UpdateRatingDto } from './DTO/UpdateRatingDto';
import { Court } from 'src/court/entities/court.entity';
import { BookingStatus } from 'src/common/enum/BookingStatus';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  async createRating(createRatingDto: CreateRatingDto, ownerId: string) {
    const { courtId } = createRatingDto;
    if (!isUuid(courtId)) {
      throw new HttpException('Invalid court ID', HttpStatus.BAD_REQUEST);
    }
    const court = await this.ratingRepository.findOne({
      where: {
        courtId,
        ownerId,
      },
    });
    const booking = await this.bookingRepository.findOne({
      where: {
        courtId,
        user: { userId: ownerId },
        status: BookingStatus.COMPLETED,
      },
    });
    if (!booking) {
      throw new HttpException('Bạn chưa đặt sân này', HttpStatus.BAD_REQUEST);
    }
    if (court) {
      throw new HttpException(
        'Bạn đã đánh giá sân này rồi',
        HttpStatus.BAD_REQUEST,
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newRating = queryRunner.manager.create(Rating, {
        ...createRatingDto,
        ownerId,
        createdAt: new Date(),
      });

      await queryRunner.manager.save(newRating);

      const result = await queryRunner.manager
        .createQueryBuilder(Rating, 'r')
        .select('AVG(r.star)', 'avg')
        .where('r.courtId = :courtId', { courtId })
        .getRawOne<{ avg: string }>();

      const avg = result?.avg ?? '0';

      const avgRating = parseFloat(avg)
        ? parseFloat(parseFloat(avg).toFixed(1))
        : 0;

      await queryRunner.manager.update(Court, { courtId }, { avgRating });
      await queryRunner.commitTransaction();
      return newRating;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRating(courtId: string, page: number, limit: number) {
    const queryBuilder = this.ratingRepository
      .createQueryBuilder('rating')
      .where('rating.courtId = :courtId', { courtId })
      .orderBy('rating.createdAt', 'DESC');
    return paginate<Rating>(queryBuilder, { page, limit });
  }

  async deleteRating(ratingId: string) {
    if (!isUuid(ratingId)) {
      throw new HttpException('Invalid rating ID', HttpStatus.BAD_REQUEST);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lấy rating để biết courtId (vì còn phải update court)
      const rating = await queryRunner.manager.findOne(Rating, {
        where: { ratingId },
      });

      if (!rating) {
        throw new HttpException('Rating not found', HttpStatus.NOT_FOUND);
      }

      const courtId = rating.courtId;

      // 2. Xóa rating
      await queryRunner.manager.delete(Rating, { ratingId });

      // 3. Tính lại avg
      const result = await queryRunner.manager
        .createQueryBuilder(Rating, 'r')
        .select('AVG(r.star)', 'avg')
        .where('r.courtId = :courtId', { courtId })
        .getRawOne<{ avg: string }>();

      const avgRating = result?.avg
        ? parseFloat(parseFloat(result.avg).toFixed(1))
        : 0;

      // 4. Update court
      await queryRunner.manager.update(Court, { courtId }, { avgRating });

      // 5. Commit
      await queryRunner.commitTransaction();

      return { message: 'Rating deleted successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRating(ratingId: string, updateRatingDto: UpdateRatingDto) {
    if (!isUuid(ratingId)) {
      throw new HttpException('Invalid rating ID', HttpStatus.BAD_REQUEST);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const rating = await this.ratingRepository.findOne({
        where: { ratingId },
      });
      if (!rating) {
        throw new HttpException('Rating not found', HttpStatus.NOT_FOUND);
      }
      const { star, content } = updateRatingDto;
      if (star) {
        rating.star = star;
      }
      if (content) {
        rating.content = content;
      }
      await queryRunner.manager.save(Rating, rating);

      const result = await queryRunner.manager
        .createQueryBuilder(Rating, 'r')
        .select('AVG(r.star)', 'avg')
        .where('r.courtId = :courtId', { courtId: rating.courtId })
        .getRawOne<{ avg: string }>();

      const avgRating = result?.avg
        ? parseFloat(parseFloat(result.avg).toFixed(1))
        : 0;

      await queryRunner.manager.update(
        Court,
        { courtId: rating.courtId },
        { avgRating },
      );

      await queryRunner.commitTransaction();
      return rating;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
