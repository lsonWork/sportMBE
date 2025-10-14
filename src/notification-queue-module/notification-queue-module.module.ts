import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CronProducerService } from './cron-producer.service';
import { CronProcessor } from './cron.processor';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'cronQueue',
    }),
    NotificationModule,
  ],
  providers: [CronProcessor, CronProducerService],
  exports: [CronProducerService],
})
export class NotificationQueueModuleModule {}
