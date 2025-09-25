import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Module({
  controllers: [RatingController],
  providers: [RatingService],
  imports: [TypeOrmModule.forFeature([Rating, Booking])],
})
export class RatingModule {}
