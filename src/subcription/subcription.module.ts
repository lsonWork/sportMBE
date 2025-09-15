import { Module } from '@nestjs/common';
import { SubcriptionService } from './subcription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';

@Module({
  providers: [SubcriptionService],
  imports: [TypeOrmModule.forFeature([Subscription])],
})
export class SubcriptionModule {}
