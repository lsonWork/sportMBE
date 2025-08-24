import { Module } from '@nestjs/common';
import { SportTypeService } from './sport-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportType } from './entities/sportType.entity';
import { SportTypeController } from './sport-type.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [SportTypeService],
  imports: [TypeOrmModule.forFeature([SportType]), AuthModule],
  controllers: [SportTypeController],
})
export class SportTypeModule {}
