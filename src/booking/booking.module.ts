import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingController } from './booking.controller';
import { BookingOwnerController } from './booking.owner.controller';
import { BookingInviteeModule } from '../booking-invitee/booking-invitee.module';

@Module({
  providers: [BookingService],
  imports: [TypeOrmModule.forFeature([Booking]), BookingInviteeModule],
  controllers: [BookingController, BookingOwnerController],
})
export class BookingModule {}
