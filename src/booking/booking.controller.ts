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
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from '@nestjs/common';

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
