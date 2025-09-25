import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { CreateRatingDto } from './DTO/CreateRatingDto';
import { validate as isUuid } from 'uuid';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
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
    const newRating = this.ratingRepository.create({
      ...createRatingDto,
      ownerId,
      createdAt: new Date(),
    });
    return this.ratingRepository.save(newRating);
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
    const result = await this.ratingRepository.delete({ ratingId });

    if (result.affected === 0) {
      throw new HttpException('Rating not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Rating deleted successfully' };
  }
}
