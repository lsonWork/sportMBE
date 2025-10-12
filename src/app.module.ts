import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportTypeModule } from './sport-type/sport-type.module';
import { CourtModule } from './court/court.module';
import { UserModule } from './user/user.module';
import { SubcriptionModule } from './subcription/subcription.module';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { NotificationModule } from './notification/notification.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';

// Các import được thêm vào cho Mailer
import { MailModule } from './mail/mail.module';
import { RolesGuard } from './common/guards/role.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RequestUpdateModule } from './request-update/request-update.module';
import { FriendModule } from './friend/friend.module';
import { RatingModule } from './rating/rating.module';
// import { BullModule } from '@nestjs/bull';
// import { RedisService } from './redis/redis.service';
// import { NotificationQueueModuleModule } from './notification-queue-module/notification-queue-module.module';

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
      logging: true,
    }),
    // BullModule.forRootAsync({
    //   inject: [RedisService],
    //   useFactory: (redisService: RedisService) => {
    //     console.log('⚙️ BullModule.forRootAsync called!');
    //     const client = redisService.getClient();

    //     console.log('⚙️ Bull got Redis client:', client?.constructor?.name);
    //     console.log(
    //       '⚙️ Redis client options inside Bull:',
    //       client ? client['options'] : 'undefined',
    //     );

    //     return {
    //       createClient: (type) => {
    //         console.log(`⚙️ Bull creating Redis client for type: ${type}`);
    //         switch (type) {
    //           case 'client':
    //             return client;
    //           case 'subscriber':
    //             return client.duplicate();
    //           default:
    //             return client.duplicate();
    //         }
    //       },
    //     };
    //   },
    // }),
    SportTypeModule,
    CourtModule,
    UserModule,
    SubcriptionModule,
    AdvertisementModule,
    NotificationModule,
    BookingModule,
    PaymentModule,
    FriendRequestModule,
    AuthModule,
    MailModule,
    RequestUpdateModule,
    FriendModule,
    RatingModule,
    // NotificationQueueModuleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
