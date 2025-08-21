import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';

@Module({
  providers: [FeedbackService],
  imports: [TypeOrmModule.forFeature([Feedback])],
})
export class FeedbackModule {}
