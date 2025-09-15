import { Module } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { AdvertisementController } from './advertisement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Advertisement])],
  providers: [AdvertisementService],
  exports: [TypeOrmModule],
  controllers: [AdvertisementController],
})
export class AdvertisementModule {}
