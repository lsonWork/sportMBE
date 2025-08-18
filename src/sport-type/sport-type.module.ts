import { Module } from '@nestjs/common';
import { SportTypeService } from './sport-type.service';

@Module({
  providers: [SportTypeService],
})
export class SportTypeModule {}
