// import { InjectQueue } from '@nestjs/bull';
// import type { Queue } from 'bull';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class NotificationQueueService {
//   constructor(
//     @InjectQueue('notification-queue')
//     private notificationQueue: Queue,
//   ) {}

//   async scheduleNotification(userId: string, message: string, delayMs: number) {
//     await this.notificationQueue.add(
//       'sendNotification', // trùng tên với @Process ở trên
//       { userId, message },
//       { delay: delayMs }, // Thời gian delay trước khi xử lý
//     );

//     console.log(`📦 Job created for ${userId}, delayed ${delayMs}ms`);
//   }
// }
