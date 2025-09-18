import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { Request } from '@nestjs/common';
import { CompleteBookingDto } from './DTO/complete-booking.dto';

@Controller('owner/bookings')
export class BookingOwnerController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiBearerAuth('access-token')
  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  async confirm(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const user = req.user;
    return this.bookingService.confirmBooking(id, user);
  }

  @ApiBearerAuth('access-token')
  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeBookingDto: CompleteBookingDto,
    @Request() req,
  ) {
    const user = req.user; // Lấy chủ sân/admin đang đăng nhập
    return this.bookingService.completeBooking(id, completeBookingDto, user);
  }
}
