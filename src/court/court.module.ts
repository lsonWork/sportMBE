import { Module } from '@nestjs/common';
import { CourtService } from './court.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { CourtImage } from './entities/courtImage.entity';
import { SportType } from 'src/sport-type/entities/sportType.entity';
import { CourtController } from './court.admin.controller';
import { CourtPublicController } from './court.public.controller';
import { User } from 'src/user/entities/user.entity';
// import { BookingService } from 'src/booking/booking.service';
import { BookingModule } from 'src/booking/booking.module';
import { PaymentModule } from 'src/payment/payment.module';
import { OwnerController } from './owner.controller';
// import { PaymentService } from 'src/payment/payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Court, CourtImage, SportType, User]),
    BookingModule,
    PaymentModule,
  ],
  providers: [CourtService],
  controllers: [CourtController, CourtPublicController, OwnerController],
})
export class CourtModule {}
