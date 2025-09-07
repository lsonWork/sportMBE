import { Module } from '@nestjs/common';
import { RequestUpdateController } from './request-update.controller';
import { RequestUpdateService } from './request-update.service';

@Module({
  controllers: [RequestUpdateController],
  providers: [RequestUpdateService]
})
export class RequestUpdateModule {}
