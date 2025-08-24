import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportTypeModule } from './sport-type/sport-type.module';
import { CourtModule } from './court/court.module';
import { FeedbackModule } from './feedback/feedback.module';
import { UserModule } from './user/user.module';
import { SubcriptionModule } from './subcription/subcription.module';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { NotificationModule } from './notification/notification.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { AuthModule } from './auth/auth.module';

// Các import được thêm vào cho Mailer
import { MailModule } from './mail/mail.module';
import { RolesGuard } from './common/guards/role.guard';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: false,
    }),
    SportTypeModule,
    CourtModule,
    FeedbackModule,
    UserModule,
    SubcriptionModule,
    AdvertisementModule,
    NotificationModule,
    BookingModule,
    PaymentModule,
    FriendRequestModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
