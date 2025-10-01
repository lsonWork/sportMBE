import { Module } from '@nestjs/common';
import { SubcriptionService } from './subcription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubcriptionController } from './subcription.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [SubcriptionService],
  imports: [TypeOrmModule.forFeature([Subscription]), UserModule],
  controllers: [SubcriptionController],
})
export class SubcriptionModule {}
