import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './DTO/create-booking.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from '@nestjs/common';

@Controller('/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiBearerAuth('access-token')
  @Post()
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    const user = req.user;
    return this.bookingService.createBooking(createBookingDto, user);
  }

  @ApiBearerAuth('access-token')
  @Patch(':id/cancel-by-user')
  async cancelByUser(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const user = req.user;
    return this.bookingService.cancelBookingByUser(id, user);
  }
}
