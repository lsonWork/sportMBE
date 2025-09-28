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
      required: ['courtId', 'startTime', 'endTime'], // Các trường bắt buộc
      properties: {
        courtId: {
          type: 'string',
          format: 'uuid',
          description: 'ID của sân cần đặt',
          example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        },
        startTime: {
          type: 'string',
          format: 'date-time',
          description: 'Thời gian bắt đầu đặt sân (định dạng ISO 8601)',
          example: '2025-09-21T10:00:00.000Z',
        },
        endTime: {
          type: 'string',
          format: 'date-time',
          description: 'Thời gian kết thúc đặt sân (định dạng ISO 8601)',
          example: '2025-09-21T11:00:00.000Z',
        },
        bookingDate: {
          type: 'string',
          format: 'date-time',
          description: 'Thời gian đặt sân (định dạng ISO 8601)',
          example: '2025-09-21T11:00:00.000Z',
        },
        inviteeIds: {
          type: 'array',
          description: '(Tùy chọn) Mảng ID của những người bạn muốn mời',
          items: {
            type: 'string',
            format: 'uuid',
          },
          example: [
            'd290f1ee-6c54-4b01-90e6-d701748f0851',
            'e290f1ee-6c54-4b01-90e6-d701748f0852',
          ],
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

  @ApiBearerAuth('access-token')
  @Patch(':id/cancel-by-user')
  async cancelByUser(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtUser,
  ) {
    return this.bookingService.cancelBookingByUser(id, user.userId);
  }

  @ApiBearerAuth('access-token')
  @Get('/my-bookings')
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'Trạng thái của booking (có thể là PENDING_DEPOSIT, CONFIRMED, COMPLETED, CANCELED) Default là CONFIRMED',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  async getMyBookings(
    @GetUser() user: JwtUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingService.getMyBookings(
      user.userId,
      { page, limit },
      status,
    );
  }
}
