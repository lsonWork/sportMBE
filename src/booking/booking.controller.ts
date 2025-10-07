import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './DTO/create-booking.dto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { BookingStatus } from 'src/common/enum/BookingStatus';

@Controller('/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiBearerAuth('access-token')
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['courtId', 'selections'],
      properties: {
        courtId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        selections: {
          type: 'array',
          example: [
            {
              date: '2025-10-28',
              am: { slotIds: ['slot-0800-0900', 'slot-0900-1000'] },
              pm: { slotIds: ['slot-1400-1500'] },
            },
            {
              date: '2025-10-29',
              am: { slotIds: [] },
              pm: { slotIds: ['slot-1500-1600'] },
            },
          ],
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date' },
              am: {
                type: 'object',
                properties: {
                  slotIds: { type: 'array', items: { type: 'string' } },
                },
              },
              pm: {
                type: 'object',
                properties: {
                  slotIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        inviteeIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
          example: ['d290f1ee-6c54-4b01-90e6-d701748f0851'],
        },
      },
    },
  })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @GetUser() user: JwtUser,
  ) {
    return this.bookingService.createBooking(createBookingDto, user.userId);
  }

  // @ApiBearerAuth('access-token')
  // @Patch(':id/cancel-by-user')
  // async cancelByUser(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @GetUser() user: JwtUser,
  // ) {
  //   return this.bookingService.cancelBookingByUser(id, user.userId);
  // }

  // @ApiBearerAuth('access-token')
  // @Get('/my-bookings')
  // @ApiQuery({
  //   name: 'status',
  //   required: false,
  //   type: String,
  //   description:
  //     'Trạng thái của booking (có thể là PENDING_DEPOSIT, CONFIRMED, COMPLETED, CANCELED) Default là CONFIRMED',
  // })
  // @ApiQuery({
  //   name: 'search',
  //   required: false,
  //   type: String,
  //   description: 'Từ khóa tìm kiếm',
  // })
  // async getMyBookings(
  //   @GetUser() user: JwtUser,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
  //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  //   @Query('status') status?: BookingStatus,
  // ) {
  //   return this.bookingService.getMyBookings(
  //     user.userId,
  //     { page, limit },
  //     status,
  //   );
  // }
}
