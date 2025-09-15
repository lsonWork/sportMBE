import { Module } from '@nestjs/common';
import { SportTypeService } from './sport-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportType } from './entities/sportType.entity';

@Module({
  providers: [SportTypeService],
  imports: [TypeOrmModule.forFeature([SportType])],
})
export class SportTypeModule {}
