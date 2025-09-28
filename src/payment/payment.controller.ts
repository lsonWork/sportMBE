import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth('access-token')
  @Get('/my-payments')
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description:
      'Trạng thái của giao dịch (PENDING, COMPLETED, FAILED) Default là PENDING',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  async getMyPayments(
    @GetUser() user: JwtUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('status', new DefaultValuePipe(PaymentStatus.PENDING))
    status?: PaymentStatus,
  ) {
    return this.paymentService.getMyPayments(
      user.userId,
      { page, limit },
      status,
    );
  }
}
