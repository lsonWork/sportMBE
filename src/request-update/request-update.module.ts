import { Module } from '@nestjs/common';
import { RequestUpdateController } from './request-update.controller';
import { RequestUpdateService } from './request-update.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestUpdate } from './entities/request-update.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestUpdate])],
  controllers: [RequestUpdateController],
  providers: [RequestUpdateService],
})
export class RequestUpdateModule {}
