import { Module } from '@nestjs/common';
import { CourtService } from './court.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { CourtImage } from './entities/courtImage.entity';
import { SportType } from 'src/sport-type/entities/sportType.entity';
import { CourtController } from './court.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Court, CourtImage, SportType])],
  providers: [CourtService],
  controllers: [CourtController],
})
export class CourtModule {}
