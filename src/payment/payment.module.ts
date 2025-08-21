import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';

@Module({
  providers: [PaymentService],
  imports: [TypeOrmModule.forFeature([Payment])],
})
export class PaymentModule {}
