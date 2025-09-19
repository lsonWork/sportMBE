import { Controller } from '@nestjs/common';
import { BookingInviteeService } from './booking-invitee.service';

@Controller('booking-invitee')
export class BookingInviteeController {
  constructor(private readonly bookingInviteeService: BookingInviteeService) {}
}
