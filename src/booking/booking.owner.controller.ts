import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { CompleteBookingDto } from './DTO/complete-booking.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';

@Controller('owner/bookings')
export class BookingOwnerController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiBearerAuth('access-token')
  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtUser,
  ) {
    return this.bookingService.confirmBookingOrder(id, user.userId);
  }

  @ApiBearerAuth('access-token')
  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        PaymentMethod: {
          type: 'string',
          example: 'CASH/BANK_TRANSFER',
        },
      },
    },
  })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeBookingDto: CompleteBookingDto,
    @GetUser() user: JwtUser,
  ) {
    return this.bookingService.completeBookingOrder(
      id,
      user.userId,
      completeBookingDto,
    );
  }
}
