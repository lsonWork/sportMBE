import { Module } from '@nestjs/common';
import { CourtService } from './court.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { CourtImage } from './entities/courtImage.entity';
import { SportType } from 'src/sport-type/entities/sportType.entity';
import { CourtController } from './court.admin.controller';
import { CourtPublicController } from './court.public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Court, CourtImage, SportType])],
  providers: [CourtService],
  controllers: [CourtController, CourtPublicController],
})
export class CourtModule {}
