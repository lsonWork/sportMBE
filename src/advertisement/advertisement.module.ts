import { Module } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Advertisement])],
  providers: [AdvertisementService],
  exports: [TypeOrmModule],
})
export class AdvertisementModule {}
