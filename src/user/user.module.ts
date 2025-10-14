import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSubscription } from './entities/userSubcription.entity';
import { UserController } from './user.controller';
import { UserAdminController } from './user.admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { OwnerPaymentInfo } from './entities/owner-payment-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSubscription, OwnerPaymentInfo]),
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [UserController, UserAdminController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
