import { Module } from '@nestjs/common';
import { CourtService } from './court.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { CourtImage } from './entities/courtImage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Court, CourtImage])],
  providers: [CourtService],
})
export class CourtModule {}
