import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CronProducerService } from './cron-producer.service';
import { CronProcessor } from './cron.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'cronQueue',
    }),
  ],
  providers: [CronProcessor, CronProducerService],
  exports: [CronProducerService],
})
export class NotificationQueueModuleModule {}
