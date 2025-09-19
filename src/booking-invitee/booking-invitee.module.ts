import { Module } from '@nestjs/common';
import { BookingInviteeService } from './booking-invitee.service';
import { BookingInviteeController } from './booking-invitee.controller';

@Module({
  controllers: [BookingInviteeController],
  providers: [BookingInviteeService],
})
export class BookingInviteeModule {}
