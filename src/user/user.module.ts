import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSubscription } from './entities/userSubcription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSubscription])],
  providers: [UserService],
  exports: [TypeOrmModule],
})
export class UserModule {}
