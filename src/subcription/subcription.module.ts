import { Module } from '@nestjs/common';
import { SubcriptionService } from './subcription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubcriptionController } from './subcription.controller';

@Module({
  providers: [SubcriptionService],
  imports: [TypeOrmModule.forFeature([Subscription])],
  controllers: [SubcriptionController],
})
export class SubcriptionModule {}
