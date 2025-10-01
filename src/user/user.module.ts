import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSubscription } from './entities/userSubcription.entity';
import { UserController } from './user.controller';
import { UserAdminController } from './user.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSubscription])],
  controllers: [UserController, UserAdminController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
