// import { BullModule } from '@nestjs/bull';
// import { Module } from '@nestjs/common';
// import { NotificationQueueService } from './notification-queue-module.service';
// import { NotificationProcessor } from './notification.processor';

// @Module({
//   imports: [
//     BullModule.registerQueue({
//       name: 'notification-queue',
//     }),
//   ],
//   providers: [NotificationProcessor, NotificationQueueService],
//   exports: [NotificationQueueService],
// })
// export class NotificationQueueModuleModule {}
