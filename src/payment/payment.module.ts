import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Court } from 'src/court/entities/court.entity';
import { BookingOrder } from 'src/booking/entities/booking-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Court, BookingOrder])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule {}
