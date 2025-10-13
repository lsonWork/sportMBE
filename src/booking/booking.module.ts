import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingController } from './booking.controller';
import { BookingOwnerController } from './booking.owner.controller';
import { BookingInviteeModule } from '../booking-invitee/booking-invitee.module';
import { Court } from 'src/court/entities/court.entity';
import { User } from 'src/user/entities/user.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { BookingInvitee } from 'src/booking-invitee/entities/booking-invitee.entity';
import { BookingOrder } from './entities/booking-order.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  providers: [BookingService],
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Court,
      User,
      Payment,
      BookingInvitee,
      BookingOrder,
    ]),
    BookingInviteeModule,
    NotificationModule,
  ],
  controllers: [BookingController, BookingOwnerController],
  exports: [BookingService, TypeOrmModule],
})
export class BookingModule {}
