import { Module } from '@nestjs/common';
import { SubcriptionService } from './subcription.service';

@Module({
  providers: [SubcriptionService]
})
export class SubcriptionModule {}
