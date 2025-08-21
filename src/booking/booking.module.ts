import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';

@Module({
  providers: [BookingService],
  imports: [TypeOrmModule.forFeature([Booking])],
})
export class BookingModule {}
