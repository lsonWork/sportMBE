import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';
import { CronProducerService } from './notification-queue-module/cron-producer.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cronProducerService: CronProducerService,
  ) {}

  @Get('test-bull')
  @Public()
  async testBull() {
    await this.cronProducerService.scheduleJob(
      {
        userId: '1',
        message: 'Test Bull',
      },
      5000,
    );
    return 'Test Bull';
  }
}
