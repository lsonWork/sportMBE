/* eslint-disable */
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourtService } from './court.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { CreateCourtRequestDto } from './DTO/createCourtRequestDto';
import { Request } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { EditCourtDto } from './DTO/editCourtDto';
import { Param, ParseUUIDPipe } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CourtDto } from './DTO/courtDto';
import { plainToClass } from 'class-transformer';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { BookingService } from 'src/booking/booking.service';
import { BookingStatus } from 'src/common/enum/BookingStatus';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';
import { PaymentService } from 'src/payment/payment.service';

@Controller('owner/courts')
export class CourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
  ) {}
  @ApiBearerAuth('access-token')
  @Post('/')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'San rau ma 36' },
        address: { type: 'string', example: 'Hoa Thanh Que' },
        imgUrls: {
          type: 'array',
          example: [
            'https://trangwebcuaban.com/anh1.jpg',
            'https://trangwebcuaban.com/anh2.jpg',
          ],
        },
        sportType: {
          type: 'string',
          format: 'uuid',
          description:
            'ID của loại hình thể thao (Lấy từ API GET /sport-types)',
          enum: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987e6543-e21b-12d3-a456-426614174001',
          ],
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        lat: { type: 'number', example: 10.123456 },
        lng: { type: 'number', example: 20.123456 },
        description: { type: 'string', example: 'asjdbaskdb' },
        pricePerHour: { type: 'double', example: 100 },
        subService: { type: 'string', example: 'Thue vot' },
      },
    },
  })
  async createCourt(
    @Body() createCourtDto: CreateCourtRequestDto,
    @GetUser() user: JwtUser,
  ) {
    return this.courtService.createCourt(createCourtDto, user.userId);
  }

  @ApiBearerAuth('access-token')
  @Patch('/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'San rau ma 36' },
        address: { type: 'string', example: 'Hoa Thanh Que' },
        imgUrls: {
          type: 'array',
          example: [
            'https://trangwebcuaban.com/anh1.jpg',
            'https://trangwebcuaban.com/anh2.jpg',
          ],
        },
        sportType: {
          type: 'string',
          format: 'uuid',
          description:
            'ID của loại hình thể thao (Lấy từ API GET /sport-types)',
          enum: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987e6543-e21b-12d3-a456-426614174001',
          ],
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        description: { type: 'string', example: 'asjdbaskdb' },
        pricePerHour: { type: 'double', example: 100 },
        subService: { type: 'string', example: 'Thue vot' },
      },
    },
  })
  async updateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() editCourtDto: EditCourtDto,
    @GetUser() user: JwtUser,
  ) {
    return this.courtService.updateCourt(id, editCourtDto, user.userId);
  }

  @ApiBearerAuth('access-token')
  @Get('/')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiQuery({
    name: 'sportTypeId',
    required: false,
    type: String,
    description: 'ID của loại hình thể thao',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  async findMyCourts(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('sportTypeId') sportTypeId?: string,
    @Query('search') search?: string,
  ): Promise<Pagination<CourtDto>> {
    limit = limit > 100 ? 100 : limit;
    const loggedInUser = req.user;
    const courtPage = await this.courtService.paginateForOwner(
      loggedInUser.userId,
      { page, limit },
      sportTypeId,
      search,
    );
    const transformedItems = courtPage.items.map((court) =>
      plainToClass(CourtDto, court, {
        excludeExtraneousValues: true,
      }),
    );

    return new Pagination<CourtDto>(transformedItems, courtPage.meta);
  }

  @ApiBearerAuth('access-token')
  @Post('/:id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  async deleteCourt(@Param('id') id: string, @GetUser() user: JwtUser) {
    return this.courtService.deleteCourtDto(user.userId, id);
  }

  @ApiBearerAuth('access-token')
  @Get(':id/bookings')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'Trạng thái của booking (có thể là PENDING_DEPOSIT, CONFIRMED, COMPLETED, CANCELED)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  async getBookingsForCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('status') status?: BookingStatus,
    @Query('search') search?: string,
  ) {
    return this.bookingService.getBookingOrdersForCourt(
      id,
      user.userId,
      { page, limit },
      status,
      search,
    );
  }

  @Get(':id/payments')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'Trạng thái của giao dịch (PENDING, COMPLETED, FAILED)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  async getPaymentsForCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('status')
    status?: PaymentStatus,
  ) {
    return this.paymentService.getPaymentsForCourt(
      id,
      user.userId,
      { page, limit },
      status,
    );
  }
}
